import type { State } from "./game";
/** Net liquid money earned/spent. Transfers between pocket and piggy bank are
 * neutral; unrealized coin price changes are not spendable daily earnings. */
export class DailyNetLedger {
  private state: State;
  private day: number;
  private total: number;
  constructor(state: State) {
    this.state = state;
    this.day = state.day;
    this.total = state.cash + state.bank;
  }
  update(state: State) {
    const total = state.cash + state.bank;
    if (state !== this.state) {
      this.state = state;
    } else if (state.day !== this.day) {
      state.dailyNet = 0;
    } else {
      state.dailyNet = (state.dailyNet ?? 0) + total - this.total;
    }
    this.total = total;
    this.day = state.day;
  }
}
