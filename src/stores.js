import { writable } from 'svelte/store';

const blankProgram = {
  selectedStations: ['s1'],
  dailyStart: 0,
  dailyStop: 43200000,
  dateStart: new Date(new Date().toLocaleDateString()).getTime(),
  dateInterval: 86400000,
  timerOn: 0,
  timerOff: 0,
  timerDuration: 0,
  timerInterval: 0,
  type: 'dow',
  dow: [],
};

const initialStationNames = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

export const selectedStations = writable(blankProgram.selectedStations);
export const dailyStart = writable(blankProgram.dailyStart);
export const dailyStop = writable(blankProgram.dailyStop);
export const dateStart = writable(blankProgram.dateStart);
export const dateInterval = writable(blankProgram.dateInterval);
export const timerOn = writable(blankProgram.timerOn);
export const timerOff = writable(blankProgram.timerOff);
export const timerDuration = writable(blankProgram.timerDuration);
export const timerInterval = writable(blankProgram.timerInterval);
export const type = writable(blankProgram.type);
export const dow = writable(blankProgram.dow);
export const programIndex = writable(0);
export const stationNames = writable(initialStationNames);

function _programs() {
  const { subscribe, set, update } = writable([{ ...blankProgram }]);

  return {
    subscribe,
    set,
    setPrograms: data =>
      update(p => {
        p = data;
        return p;
      }),
  };
}

export const programs = _programs();
