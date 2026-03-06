const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const postcode = process.argv[2];

if (!postcode) {
  console.error(`${c.red}Usage: pomp <postcode>${c.reset}\nE.g.: pomp 1234AB`);
  process.exit(1);
}

const url = `https://www.independer.nl/api/autoverzekering/gasstation/getgasstations?v=61&addressInformation=${encodeURIComponent(postcode)}&fuelType=2&range=5&sorting=1`;
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
