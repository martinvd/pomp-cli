#!/usr/bin/env node
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
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

const help = `
  Usage
    $ pomp <postcode> [--type=95]

  Options
    --type, -t   Fuel type alias

  Fuel types
    e10, 95      Euro 95 (E10)
    e5, 98       Super Plus 98 (E5)
    diesel, b7   Diesel (B7)
    lpg          LPG
    p-diesel     Premium Diesel
    p-95         Premium Benzine
    gas          Aardgas
    bio          Biodiesel

  Examples
    $ pomp 1234AB
    # Euro 95 (default)

    $ pomp 1234AB -t diesel
    # Diesel (B7)
`;

function showHelp() {
  console.log(help.trim());
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
}

const postcode = args.find((arg) => !arg.startsWith("-"));
const typeIdx = args.findIndex((arg) => arg === "--type" || arg === "-t");
const typeArg = typeIdx !== -1 ? args[typeIdx + 1] : null;
const fuelInput = (typeArg || args[1] || "95").toLowerCase();
const fuel = fuelByAlias[fuelInput] ?? fuels.find((f) => f.id === fuelInput);
const fuelType = fuel?.id ?? fuelInput;
const fuelName = fuel?.name ?? fuelInput;

if (!postcode) {
  showHelp();
}

console.log(
  `${c.dim}Looking up ${c.reset}${c.yellow}${fuelName}${c.reset}${c.dim} for ${c.reset}${c.yellow}${postcode}${c.reset}${c.dim}…${c.reset}`,
);

const url = `https://www.independer.nl/api/autoverzekering/gasstation/getgasstations?v=61&addressInformation=${encodeURIComponent(postcode)}&fuelType=${fuelType}&range=5&sorting=1`;
const res = await fetch(url);
const data = await res.json();

const stations = data.gasStations ?? [];
if (stations.length === 0) {
  console.log(`${c.yellow}No gas stations found.${c.reset}`);
} else {
  const nameW = 28;
  const priceW = 9;
  const distW = 7;
  const padR = (s, n) => String(s).padStart(n);
  const padL = (s, n) => String(s).padEnd(n);

  console.log(
    `\n  ${c.bold}${padR("#", 3)}  ${padL("Station", nameW)}  ${padR("Price", priceW)}  ${padR("Dist", distW)}  Address${c.reset}`,
  );
  console.log(
    `  ${c.dim}${"─".repeat(3)}  ${"─".repeat(nameW)}  ${"─".repeat(priceW)}  ${"─".repeat(distW)}  ${"─".repeat(36)}${c.reset}`,
  );

  stations.forEach((s, i) => {
    const addr = s.location.address;
    const shortAddr = `${addr.streetName} ${addr.houseNumber}, ${addr.city}`;
    const price = `€${s.fuel.fuelPrice.toFixed(3)}`;
    const dist = `${s.distance.toFixed(1)} km`;
    const name = (s.name || "").slice(0, nameW);
    const rank = i + 1;
    const rankStr =
      rank === 1
        ? `${c.green}${padR(rank, 3)}${c.reset}`
        : `${c.dim}${padR(rank, 3)}${c.reset}`;
    const pricePadded = padR(price, priceW);
    const priceStr =
      rank === 1 ? `${c.green}${pricePadded}${c.reset}` : pricePadded;
    console.log(
      `  ${rankStr}  ${c.yellow}${padL(name, nameW)}${c.reset}  ${priceStr}  ${c.dim}${padR(dist, distW)}${c.reset}  ${c.dim}${shortAddr}${c.reset}`,
    );
  });
}
