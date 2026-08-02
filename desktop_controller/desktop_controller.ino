#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

//==========================
// WiFi
//==========================

const char* ssid = "Nothing Phone (2a)_5220";
const char* wifi_password = "12345678";

//==========================
// HiveMQ
//==========================

const char* mqtt_server = "6a116be4db554f028869a6021f034e18.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

const char* mqtt_username = "esp32";
const char* mqtt_password = "esp32@123";

//==========================

WiFiClientSecure espClient;
PubSubClient client(espClient);

Servo servoUPS;
Servo servoCPU;

const int UPS_PIN = 2;
const int CPU_PIN = 4;

void connectWiFi()
{
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting WiFi");
  WiFi.begin(ssid, wifi_password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi Connected : ");
  Serial.println(WiFi.localIP());
}

bool validAngle(int a)
{
  return a >= 0 && a <= 180;
}

void publishResult(const char *device, const char *state)
{
  String topic = "desktop/";
  topic += device;
  topic += "/result";
  client.publish(topic.c_str(), state, false);
}

void moveServo(Servo &servo,
               int startAngle,
               int rotateAngle,
               const char *device)
{
  if (!validAngle(startAngle) || !validAngle(rotateAngle))
  {
    publishResult(device, "FAILED");
    return;
  }

  publishResult(device, "STARTED");

  servo.write(startAngle);
  delay(200);

  servo.write(rotateAngle);
  delay(700);

  servo.write(startAngle);
  delay(300);

  publishResult(device, "DONE");
}

void callback(char *topic, byte *payload, unsigned int length)
{
  String message;
  message.reserve(length);

  for (unsigned int i = 0; i < length; i++)
    message += (char)payload[i];

  StaticJsonDocument<128> doc;

  if (deserializeJson(doc, message))
  {
    Serial.println("Invalid JSON");
    return;
  }

  if (!doc.containsKey("start") || !doc.containsKey("rotate"))
  {
    Serial.println("Missing JSON field");
    return;
  }

  int startAngle = doc["start"];
  int rotateAngle = doc["rotate"];

  if (strcmp(topic, "home/ups") == 0)
  {
    moveServo(servoUPS, startAngle, rotateAngle, "ups");
  }
  else if (strcmp(topic, "home/cpu") == 0)
  {
    moveServo(servoCPU, startAngle, rotateAngle, "cpu");
  }
}

void reconnectMQTT()
{
  while (!client.connected())
  {
    connectWiFi();

    String clientId = "ESP32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

    if (client.connect(
            clientId.c_str(),
            mqtt_username,
            mqtt_password,
            "desktop/status",
            1,
            true,
            "OFFLINE"))
    {
      Serial.println("MQTT Connected");

      client.subscribe("home/ups");
      client.subscribe("home/cpu");

      client.publish("desktop/status", "ONLINE", true);
    }
    else
    {
      Serial.print("MQTT Failed rc=");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);

  servoUPS.setPeriodHertz(50);
  servoCPU.setPeriodHertz(50);

  servoUPS.attach(UPS_PIN, 500, 2400);
  servoCPU.attach(CPU_PIN, 500, 2400);

  delay(500);

  servoUPS.write(180);
  servoCPU.write(180);

  connectWiFi();

  espClient.setInsecure();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  reconnectMQTT();

  Serial.println("System Ready");
}

void loop()
{
  if (WiFi.status() != WL_CONNECTED)
    connectWiFi();

  if (!client.connected())
    reconnectMQTT();

  client.loop();
}
