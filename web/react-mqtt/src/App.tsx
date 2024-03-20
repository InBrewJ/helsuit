import { useEffect, useState } from "react";
import "./App.css";
import mqtt from "mqtt";

const MQTT_SERVER_FULL_URL = "ws://oz.urawizard.com:15675/ws";

enum Location {
  UNKNOWN = "UNKNOWN",
  HOME = "Home",
}

function App() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [suspectedLocation, setSuspectedLocation] = useState<Location>(
    Location.UNKNOWN
  );

  useEffect(() => {
    setClient(mqtt.connect(MQTT_SERVER_FULL_URL));
    return () => {
      client?.end();
    };
  }, []);

  useEffect(() => {
    if (client != null) {
      client.on("connect", () => {
        client.subscribe("helsuit/sleeper-service/sos", (err: Error | null) => {
          if (!err) {
            client.publish(
              "helsuit/sleeper-service/receive",
              "Hello from helsuit-web"
            );
          }
        });
      });

      client.on("message", (_: string, message: Buffer) => {
        setLastMessage(message.toString());
      });
    }
  }, [client, setLastMessage]);

  useEffect(() => {
    if (lastMessage.search('ESSID:"FallenPine"') != -1) {
      setSuspectedLocation(Location.HOME);
    } else {
      setSuspectedLocation(Location.UNKNOWN);
    }
  }, [lastMessage]);

  return (
    <>
      <h1>Helsuit (sleeper-service)</h1>
      <div className="card">
        <h2>Suspected location</h2>
        <p>{suspectedLocation}</p>
      </div>
      <div className="card">
        <h2>Last message in full...</h2>
        <p>{lastMessage || "nothing received yet..."}</p>
      </div>
    </>
  );
}

export default App;
