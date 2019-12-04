import { writable } from "svelte/store";

const blankProgram = {
  selectedStations: [],
  dailyStart: 21600000,
  dailyStop: 64800000,
  dateStart: new Date(new Date().toLocaleDateString()).getTime(),
  dateInterval: 86400000,
  timerOn: 0,
  timerOff: 0,
  timerDuration: 0,
  timerInterval: 0,
  type: "interval",
  DOW: []
};

const stationNames = {
  s1: "s1",
  s2: "s2",
  s3: "s3",
  s4: "s4",
  s5: "s5",
  s6: "s6",
  s7: "s7",
  s8: "s8"
};

const initialState= {
programs: [blankProgram],
programIndex: 0,
stationNames: stationNames,
currentProgram: blankProgram,
}

function currentState() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    increment: () =>
      update(program => {
        program.n++;
        return program;
      }),
    decrement: () =>
      update(program => {
        program.n--;
        return program;
      }),
    reset: () => set({ n: 0 })
  };
}

export const state = currentState();
