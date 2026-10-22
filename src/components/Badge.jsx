import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../constants.js";
import { labelOf } from "../utils.js";

export default function Badge({ kind, value }) {
  const options = kind === "status" ? STATUS_OPTIONS : PRIORITY_OPTIONS;
  return <span className={`badge badge-${kind}-${value}`}>{labelOf(options, value)}</span>;
}
