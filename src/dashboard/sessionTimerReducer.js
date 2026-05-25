export const SESSION_TIMER_INITIAL = { pauseMs: 0, pauseBeganAt: null };

export function sessionTimerReducer(state, action) {
  switch (action.type) {
    case "reset":
      return SESSION_TIMER_INITIAL;
    case "pause":
      if (state.pauseBeganAt != null) return state;
      return { ...state, pauseBeganAt: Date.now() };
    case "resume": {
      const began = state.pauseBeganAt;
      if (began == null) return state;
      return {
        pauseMs: state.pauseMs + (Date.now() - began),
        pauseBeganAt: null,
      };
    }
    default:
      return state;
  }
}
