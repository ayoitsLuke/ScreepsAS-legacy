const CARRY_CAPACITY = 50;
const BODYPART_COST = {
  "m": 50,
  "w": 100,
  "a": 80,
  "c": 50,
  "h": 250,
  "r": 150,
  "t": 10,
  "C": 600
};

function eff(body, d) {
  const moveCost = 1
  const fagtiguePerMOVE = 2 / moveCost;
  const parts = _.countBy(body);
  if (!parts.w || !parts.c || !parts.m) return 0;
  const speedWhileFull = Math.ceil((body.length - parts.m) / (fagtiguePerMOVE * parts.m)); // tick/tile
  const speedWhileEmpty = Math.ceil((body.length - parts.m - (parts.c || 0)) / (fagtiguePerMOVE * parts.m));
  const throughput = (parts.c || 0) * CARRY_CAPACITY;
  const workTime = Math.ceil(throughput / (parts.w || 0) * 1); // 1 energy/WORK
  // console.log(speedWhileFull,speedWhileEmpty,parts.c)
  const spawnCost = body.reduce((t, p) => t + BODYPART_COST[p], 0);
  const avgThroughput = throughput / (speedWhileFull * d + speedWhileEmpty * d + workTime);
  return [parts, (avgThroughput / body.length)
    .toPrecision(
      3), (avgThroughput / spawnCost)
    .toPrecision(5)
  ];
};

const d = 10;
console.log(["parts", "ePerParts", "ePerCost"]);
console.log("2m:")
console.log(eff(["m", "m", "w", "c", "c", "c"], d))
console.log(eff(["m", "m", "w", "w", "c", "c"], d)) // 238 357
console.log(eff(["m", "m", "w", "w", "w", "c"], d))

console.log(eff(["m", "m", "w", "c", "c"], d))
console.log(eff(["m", "m", "w", "w", "c"], d))

console.log("1m:")
console.log(eff(["m", "w", "c", "c", "c", "c"], d))
console.log(eff(["m", "w", "w", "c", "c", "c"], d)) // 217 326
console.log(eff(["m", "w", "w", "w", "c", "c"], d))
console.log(eff(["m", "w", "w", "w", "w", "c"], d))

console.log(eff(["m", "w", "c", "c", "c"], d))
console.log(eff(["m", "w", "w", "c", "c"], d)) //! 250 357 best parts for Constructor_m_hc
console.log(eff(["m", "w", "w", "w", "c"], d))

console.log(eff(["m", "w", "w", "c"], d))
console.log(eff(["m", "w", "c", "c"], d))

console.log(eff(["m", "w", "c"], d)) // 238 357
