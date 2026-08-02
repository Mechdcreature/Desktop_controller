// ================= MQTT =================

const broker =
"wss://6a116be4db554f028869a6021f034e18.s1.eu.hivemq.cloud:8884/mqtt";

const options = {

    username: "esp32",
    password: "esp32@123",

    clean:true,

    connectTimeout:4000,

    clientId:"web_"+Math.random().toString(16).substr(2,8)

};

const client = mqtt.connect(broker, options);

let esp32Online = false;

let servoBusy = false;



const status=document.getElementById("status");

client.on("connect",()=>{

    status.innerHTML="🟢 Broker Connected";

    client.subscribe("desktop/status");

    client.subscribe("desktop/ups/result");
    client.subscribe("desktop/cpu/result");

});

client.on("message",(topic,message)=>{

    const msg = message.toString();

    if(topic==="desktop/status")
    {

        if(msg==="ONLINE")
        {

            esp32Online=true;

            status.innerHTML="🟢 ESP32 Online";

            if(!servoBusy)
            {
                document.getElementById("upsBtn").disabled = false;
                document.getElementById("cpuBtn").disabled = false;
            }

        }

        else if(msg==="OFFLINE")
        {

            esp32Online=false;
            servoBusy = false;

            status.innerHTML="🔴 ESP32 Offline";

            document.getElementById("upsBtn").disabled=true;
            document.getElementById("cpuBtn").disabled=true;

            document.getElementById("upsBtn").innerHTML = "Trigger UPS";
            document.getElementById("cpuBtn").innerHTML = "Trigger CPU";

        }

    }  

    if(topic==="desktop/ups/result")
    {

        handleResult("ups",msg);

    }

    if(topic==="desktop/cpu/result")
    {

        handleResult("cpu",msg);

    }

});

client.on("error",()=>{

    status.innerHTML="🔴 MQTT Connection Failed";

});

client.on("close", () => {

    esp32Online = false;
    servoBusy = false;

    status.innerHTML = "🔴 Broker Disconnected";

    document.getElementById("upsBtn").disabled = true;
    document.getElementById("cpuBtn").disabled = true;

    document.getElementById("upsBtn").innerHTML = "Trigger UPS";
    document.getElementById("cpuBtn").innerHTML = "Trigger CPU";

});

// ================= LED =================

let upsState = localStorage.getItem("upsState") || "OFF";
let cpuState = localStorage.getItem("cpuState") || "OFF";

// Load saved angles

document.getElementById("upsStart").value =
localStorage.getItem("upsStart") || 180;

document.getElementById("upsRotate").value =
localStorage.getItem("upsRotate") || 0;

document.getElementById("cpuStart").value =
localStorage.getItem("cpuStart") || 180;

document.getElementById("cpuRotate").value =
localStorage.getItem("cpuRotate") || 0;

updateLed();

function updateLed(){

    const upsLed=document.getElementById("upsLed");
    const cpuLed=document.getElementById("cpuLed");

    if(upsState=="ON")
        upsLed.classList.add("on");
    else
        upsLed.classList.remove("on");

    if(cpuState=="ON")
        cpuLed.classList.add("on");
    else
        cpuLed.classList.remove("on");

}

// ================= VALIDATION =================

function validAngle(value){

    if(value==="") return false;

    value=parseInt(value);

    if(isNaN(value)) return false;

    if(value<0 || value>180) return false;

    return true;

}

// ================= SEND MQTT =================

function trigger(device){

    let start;
    let rotate;
    let button;
    let error;

    if(!esp32Online)
    {
        alert("ESP32 is Offline");
        return;
    }

    if (servoBusy)
    {
        alert("Another operation is already in progress.");
        return;
    }

    if(device=="ups"){

        start=document.getElementById("upsStart").value;

        rotate=document.getElementById("upsRotate").value;

        button=document.getElementById("upsBtn");

        error=document.getElementById("upsError");

    }

    else{

        start=document.getElementById("cpuStart").value;

        rotate=document.getElementById("cpuRotate").value;

        button=document.getElementById("cpuBtn");

        error=document.getElementById("cpuError");

    }

    error.innerHTML="";

    if(!validAngle(start) || !validAngle(rotate)){

        error.innerHTML="❌ Valid Range : 0° - 180°";

        return;

    }

    // Save user settings

    if(device=="ups")
    {

        localStorage.setItem("upsStart",start);

        localStorage.setItem("upsRotate",rotate);

    }
    else
    {

        localStorage.setItem("cpuStart",start);

        localStorage.setItem("cpuRotate",rotate);

    }

    const payload=JSON.stringify({

        start:parseInt(start),

        rotate:parseInt(rotate)

    });

    servoBusy = true;

    document.getElementById("upsBtn").disabled = true;
    document.getElementById("cpuBtn").disabled = true;

    button.innerHTML = "⏳ Waiting...";

    client.publish(
        "home/" + device,
        payload,
        function(err)
        {
            if(err)
            {
                servoBusy = false;

                document.getElementById("upsBtn").disabled = false;
                document.getElementById("cpuBtn").disabled = false;

                button.innerHTML = "❌ Publish Failed";

                setTimeout(() => {

                    button.innerHTML =
                    device=="ups" ?
                    "Trigger UPS" :
                    "Trigger CPU";

                },1500);
            }
        }
    );
}

    // Timeout after 3 seconds
    setTimeout(() => {

        if (button.innerHTML === "⏳ Waiting..." ||
            button.innerHTML === "⏳ Executing...")
        {

            servoBusy = false;

            document.getElementById("upsBtn").disabled = false;
            document.getElementById("cpuBtn").disabled = false;
            
            button.innerHTML = "❌ Timeout";

            setTimeout(() => {

                button.innerHTML =
                    device == "ups" ?
                    "Trigger UPS" :
                    "Trigger CPU";

            },1500);
        }

    },3000);

function handleResult(device,msg)
{

    let btn = 
    device=="ups" ?
    document.getElementById("upsBtn") :
    document.getElementById("cpuBtn");

    if(msg==="STARTED")
    {

        servoBusy = true;

        document.getElementById("upsBtn").disabled = true;
        document.getElementById("cpuBtn").disabled = true;

        btn.innerHTML = "⏳ Executing...";

    }

    else if(msg==="DONE")
    {

        servoBusy = false;

        document.getElementById("upsBtn").disabled = false;
        document.getElementById("cpuBtn").disabled = false;

        if(device=="ups")
        {
            upsState = upsState=="ON" ? "OFF":"ON";
            localStorage.setItem("upsState",upsState);
        }
        else
        {
            cpuState = cpuState=="ON" ? "OFF":"ON";
            localStorage.setItem("cpuState",cpuState);
        }

        updateLed();

        btn.innerHTML="✅ Completed";

        setTimeout(()=>{

            btn.innerHTML =
                device=="ups" ?
                "Trigger UPS" :
                "Trigger CPU";

        },1000);

    }

    else if(msg==="FAILED")
    {

        servoBusy = false;

        document.getElementById("upsBtn").disabled = false;
        document.getElementById("cpuBtn").disabled = false;

        btn.innerHTML="❌ Failed";

        setTimeout(()=>{

            btn.innerHTML =
                device=="ups" ?
                "Trigger UPS" :
                "Trigger CPU";

        },1500);
    }

}

// ================= BUTTON =================

document.getElementById("upsBtn").onclick=function(){

    trigger("ups");

}

document.getElementById("cpuBtn").onclick=function(){

    trigger("cpu");

}

document.getElementById("upsBtn").disabled=true;
document.getElementById("cpuBtn").disabled=true;
