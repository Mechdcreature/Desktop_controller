// MQTT Broker
const broker = "wss://6a116be4db554f028869a6021f034e18.s1.eu.hivemq.cloud:8884/mqtt";

const options = {
    username: "esp32",
    password: "esp32@123",
    clean: true,
    connectTimeout: 4000,
    clientId: "web_" + Math.random().toString(16).substr(2, 8)
};

// Connect
const client = mqtt.connect(broker, options);

// Status
const status = document.getElementById("status");

client.on("connect", function () {

    console.log("Connected");

    status.innerHTML = "🟢 Connected";

});

client.on("error", function (err) {

    console.log(err);

    status.innerHTML = "🔴 Connection Failed";

});

// Servo 1 Button
document.getElementById("servo1").onclick = function () {

    client.publish("home/servo1", "TRIGGER");

    console.log("Servo1 Trigger");

};

// Servo 2 Button
document.getElementById("servo2").onclick = function () {

    client.publish("home/servo2", "TRIGGER");

    console.log("Servo2 Trigger");

};
