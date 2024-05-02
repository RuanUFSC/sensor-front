import { useState, useEffect } from "react"
import Chart from "chart.js/auto"
import { w3cwebsocket as W3CWebSocket } from "websocket"
import { DateTime } from 'luxon'

const client = new W3CWebSocket('ws://localhost:8000/ws/all_sensor_data')

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([])
  const [chartInstance, setChartInstance] = useState(null)

  useEffect(() => {
    client.onopen = () => {
      console.log('Conexão iniciada')
    }
    client.onmessage = (message) => {
      const data = JSON.parse(message.data)
      if (JSON.stringify(data) != JSON.stringify(sensorData)) {
        setSensorData(data)
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

      const sensorIds = [...new Set(sensorData.map(sensor => sensor.sensor_id))].sort()
      const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta']

      const groupedData = {}
      sensorIds.forEach(sensorId => {
        const sensorEntries = sensorData.filter(entry => entry.sensor_id === sensorId)
        groupedData[sensorId] = sensorEntries.slice(0, 10)
      })
      
      const timestamps = groupedData[1].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(dado => DateTime.fromISO(dado.timestamp).toFormat('hh:mm:ss'))
      console.log(timestamps)
      const datasets = sensorIds.map((sensorId) => ({
        label: `Sensor ${sensorId}`,
        data: groupedData[sensorId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(sensor => sensor.data),
        fill: false,
        borderColor: colors[sensorId % 7],
        tension: 0.1
      }))

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
      })
      
      setChartInstance(newChartInstance)
    }
  }, [sensorData])

  return (
    <div>
      <h2>Gráfico do sensor</h2>
      {sensorData.length > 0 ?
      <canvas id="sensorChart" width="800" height="400"></canvas>
      : <h3>Sem dados, verifique a conexão com a API</h3>}
    </div>
  )
}

export default SensorDataChart


