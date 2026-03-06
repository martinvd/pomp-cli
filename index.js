const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const fuels = [
  { id: "1", name: "Super Plus 98 (E5)", aliases: ["98", "e5", "super98"] },
  { id: "2", name: "Euro 95 (E10)", aliases: ["95", "e10", "euro95"] },
  { id: "6", name: "Diesel (B7)", aliases: ["diesel", "b7"] },
  { id: "7", name: "LPG", aliases: ["lpg"] },
  { id: "12", name: "Premium Diesel", aliases: ["p-diesel"] },
  { id: "13", name: "Premium Benzine", aliases: ["p-95"] },
  { id: "14", name: "Aardgas", aliases: ["gas"] },
  { id: "17", name: "Biodiesel", aliases: ["bio"] },
];

const fuelByAlias = Object.fromEntries(
  fuels.flatMap((f) => f.aliases.map((a) => [a, f])),
);

const args = process.argv.slice(2);
const postcode = args.find((arg) => !arg.startsWith("-"));
const typeIdx = args.findIndex((arg) => arg === "--type" || arg === "-t");
const typeArg = typeIdx !== -1 ? args[typeIdx + 1] : null;
const fuelInput = (typeArg || args[1] || "95").toLowerCase();
const fuel = fuelByAlias[fuelInput] ?? fuels.find((f) => f.id === fuelInput);
const fuelType = fuel?.id ?? fuelInput;
const fuelName = fuel?.name ?? fuelInput;

if (!postcode) {
  console.error(
    `${c.red}Usage: pomp <postcode> [--type <type>]${c.reset}\n` +
      `E.g.: pomp 1234AB\n` +
      `     pomp 1234AB --type diesel\n` +
      `     pomp 1234AB -t 98`,
  );
  process.exit(1);
}

console.log(`${c.dim}Looking up ${c.reset}${c.yellow}${fuelName}${c.reset}${c.dim} for ${c.reset}${c.yellow}${postcode}${c.reset}${c.dim}…${c.reset}\n`);

const url = `https://www.independer.nl/api/autoverzekering/gasstation/getgasstations?v=61&addressInformation=${encodeURIComponent(postcode)}&fuelType=${fuelType}&range=5&sorting=1`;
const res = await fetch(url);
const data = await res.json();

const cheapest = data.gasStations[0];
if (!cheapest) {
  console.log(`${c.yellow}No gas stations found.${c.reset}`);
} else {
  const addr = cheapest.location.address;
  console.log(
    `${c.bold}Cheapest:${c.reset} ${c.yellow}${cheapest.name}${c.reset} – ${c.green}€${cheapest.fuel.fuelPrice.toFixed(3)}/L${c.reset}\n` +
      `${c.dim}  ${addr.streetName} ${addr.houseNumber}, ${addr.city}${c.reset}\n` +
      `${c.dim}  ${cheapest.distance.toFixed(1)} km${c.reset}`,
  );
}
