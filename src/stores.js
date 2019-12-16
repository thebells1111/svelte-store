import { writable } from 'svelte/store';

const blankProgram = {
  selectedStations: ['s1'],
  dailyStart: 21600000,
  dailyStop: 64800000,
  dateStart: new Date(new Date().toLocaleDateString()).getTime(),
  dateInterval: 86400000,
  timerOn: 0,
  timerOff: 0,
  timerDuration: 0,
  timerInterval: 0,
  type: 'interval',
  dow: [],
};

const initialStationNames = {
  s1: 's1',
  s2: 's2',
  s3: 's3',
  s4: 's4',
  s5: 's5',
  s6: 's6',
  s7: 's7',
  s8: 's8',
};

const initialState = {
  programs: [blankProgram],
  programIndex: 0,
};

function _stationNames() {
  const { subscribe } = writable(
    Object.keys(initialStationNames)
      .sort()
      .map(v => initialStationNames[v])
  );

  return {
    subscribe,
  };
}

function _currentProgram() {
  const { subscribe, set, update } = writable(blankProgram);

  return {
    subscribe,
    setStations: data =>
      update(p => {
        p.selectedStations = data;
        return p;
      }),
    setType: data =>
      update(p => {
        p.type = data;
        return p;
      }),
    setDateInterval: data =>
      update(p => {
        p.dateInterval = data * 86400000;
        return p;
      }),
    setDateStart: data =>
      update(p => {
        p.dateStart = new Date(data.toLocaleDateString()).getTime();
        return p;
      }),
    setDow: data =>
      update(p => {
        p.DOW = data;
        return p;
      }),
    setDailyStart: data =>
      update(p => {
        p.dailyStart = data;
        return p;
      }),
    setDailyStop: data =>
      update(p => {
        p.dailyStop = data;
        return p;
      }),
  };
}

export const currentProgram = _currentProgram();
export const stationNames = _stationNames();
