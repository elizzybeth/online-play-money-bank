import type { State } from "./game";
/** Net liquid money earned/spent. Transfers between pocket and piggy bank are
 * neutral; unrealized coin price changes are not spendable daily earnings. */
export class DailyNetLedger {
  private state: State;
  private day: number;
  private total: number;
  private net: number;
  constructor(state: State) {
    this.state = state;
    this.day = state.day;
    this.total = state.cash + state.bank;
    this.net = state.dailyNet ?? 0;
  }
  update(state: State) {
    const total = state.cash + state.bank;
    if (state !== this.state) {
      this.state = state;
      this.net = state.dailyNet ?? 0;
    } else if (state.day !== this.day) {
      this.net = 0;
    } else {
      this.net += total - this.total;
    }
    state.dailyNet = this.net;
    this.total = total;
    this.day = state.day;
  }
}
