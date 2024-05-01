import { useState, useEffect } from "react"
import Chart from "chart.js/auto"
import { w3cwebsocket as W3CWebSocket } from "websocket"
import { DateTime } from 'luxon';

const client = new W3CWebSocket('ws://localhost:8000/ws/all_sensor_data')

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([])
  const [chartInstance, setChartInstance] = useState(null)

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected')
    }
    client.onmessage = (message) => {
      const data = JSON.parse(message.data)
      if (JSON.stringify(data.reverse()) != JSON.stringify(sensorData)) {
        setSensorData(data.reverse())
      }
    }

    return () => {
      client.close()
    }
  }, [])

  useEffect(() => {
    if (sensorData.length > 0) {
      const ctx = document.getElementById("sensorChart")

      if (chartInstance) {
        chartInstance.destroy()
      }

      const sensorIds = [...new Set(sensorData.map(sensor => sensor.sensor_id))].sort();
      const timestamps = sensorData.map(entry => DateTime.fromISO(entry.timestamp).toFormat('hh:mm:ss'));
      const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];


      const datasets = sensorIds.map((sensorId) => ({
        label: `Sensor ${sensorId}`,
        data: sensorData.filter(sensor => sensor.sensor_id === sensorId).map(sensor => sensor.data),
        fill: false,
        borderColor: colors[sensorId],
        tension: 0.1
      }));

      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: datasets
        },
        options: {
          animation: {
            duration: 0
        }}
      });
      setChartInstance(newChartInstance)
    }
  }, [sensorData])

  return (
    <div>
      <h2>Gráfico do sensor</h2>
      <canvas id="sensorChart" width="800" height="400"></canvas>
    </div>
  )
}

export default SensorDataChart


