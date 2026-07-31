const MAP = {
  "AV:N": { label: "Attack Vector", value: "Network" },
  "AV:A": { label: "Attack Vector", value: "Adjacent" },
  "AV:L": { label: "Attack Vector", value: "Local" },
  "AV:P": { label: "Attack Vector", value: "Physical" },
  "AC:L": { label: "Attack Complexity", value: "Low" },
  "AC:H": { label: "Attack Complexity", value: "High" },
  "PR:N": { label: "Privileges Required", value: "None" },
  "PR:L": { label: "Privileges Required", value: "Low" },
  "PR:H": { label: "Privileges Required", value: "High" },
  "UI:N": { label: "User Interaction", value: "None" },
  "UI:R": { label: "User Interaction", value: "Required" },
  "S:U": { label: "Scope", value: "Unchanged" },
  "S:C": { label: "Scope", value: "Changed" },
  "C:H": { label: "Confidentiality", value: "High" },
  "C:L": { label: "Confidentiality", value: "Low" },
  "C:N": { label: "Confidentiality", value: "None" },
  "I:H": { label: "Integrity", value: "High" },
  "I:L": { label: "Integrity", value: "Low" },
  "I:N": { label: "Integrity", value: "None" },
  "A:H": { label: "Availability", value: "High" },
  "A:L": { label: "Availability", value: "Low" },
  "A:N": { label: "Availability", value: "None" },
};

export function parseVector(vector) {
  return String(vector || "")
    .split("/")
    .filter(Boolean)
    .map((part) => {
      const [k, v] = part.split(":");
      const key = `${k}:${v}`;
      const m = MAP[key];
      return { key, label: m?.label || k, value: m?.value || v };
    });
}
