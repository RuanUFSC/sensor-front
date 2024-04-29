import { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://localhost:8000/ws/all_sensor_data');

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setSensorData(data);
    };

    return () => {
      client.close();
    };
  }, []);

  useEffect(() => {
    if (sensorData.length > 0) {
      const ctx = document.getElementById("sensorChart");
      const sensorIds = sensorData.map(sensor => sensor.sensor_id);
      console.log(sensorData[0]);
      const timestamps = sensorData.map(entry => new Date(entry.timestamp));

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: sensorIds.map((sensorId, index) => ({
            label: `Sensor ${sensorId}`,
            data: sensorData[index].map(entry => entry.data),
            fill: false,
            borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
            tension: 0.1
          }))
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'second'
              },
              ticks: {
                source: 'auto'
              }
            },
            y: {
              ticks: {
                beginAtZero: true
              }
            }
          }
        }
      });
    }
  }, [sensorData]);

  return (
    <div>
      <h2>Sensor Data Chart</h2>
      <canvas id="sensorChart" width="800" height="400"></canvas>
    </div>
  );
};

export default SensorDataChart;
