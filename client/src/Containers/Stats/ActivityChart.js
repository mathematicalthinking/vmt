import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
/**
 *
 * @param {*} events: array of events
 * @param {*} initialScreen: initial screen
 * @param {*} tabs: array of tabs keyed by tab id, value is tab's label
 * @returns
 */
const ActivityChart = ({ events, initialScreen, tabs }) => {
  // create an array of labels sorted reverse chronologically by last event
  // for each label, calculate the number of events that have occurred
  // for each label, calculate the time on each tab/screen

  // iterate through the event array  create an obect of the form:
  // {
  //   tab/screen hash: [event1, event2, event3],
  //   tab/screen hash: [event1, event2, event3],
  //   ...
  // }

  // 1. sorting reverse by the timestamp in the last event in each array
  // 2. length of each array
  // 3. differenece between b/t 1st & last timestamp in each array

  const eventHash = events.reduce((event) => {
    const { tab, screen = 0 } = event;
    const hash = `${tab}-${screen}`;
    if (!eventHash[hash]) {
      eventHash[hash] = [];
    }
    eventHash[hash].push(event);
    return eventHash;
  }, {});

  const sortedEventHash = Object.keys(eventHash).sort((a, b) => {
    const lastEventA = eventHash[a][eventHash[a].length - 1];
    const lastEventB = eventHash[b][eventHash[b].length - 1];
    return lastEventB.timestamp - lastEventA.timestamp;
  });

  const labels = sortedEventHash.reduce((results, hash) => {
    const [tab, screen] = hash.split('-');
    const label = tabs[tab];
    const screenLabel = `Screen ${screen}`;
    const numberOfEvents = eventHash[hash].length;
    // get the time between the first and last event
    const firstEvent = eventHash[hash][0];
    const lastEvent = eventHash[hash][eventHash[hash].length - 1];
    const timeOnEvent = lastEvent.timestamp - firstEvent.timestamp;
    results.push({
      label,
      screenLabel,
      numberOfEvents,
      timeOnEvent,
    });
    return results;
  }, []);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const data = {
    labels: labels.map((label) => label.label),
    datasets: [
      {
        label: 'Number of Events',
        data: labels.map((label) => label.numberOfEvents),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'Time on Screen',
        data: labels.map((label) => label.timeOnEvent),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Course Data',
      },
    },
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ActivityChart;
