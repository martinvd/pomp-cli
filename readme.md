# pomp

> Find the cheapest nearby gas station by postcode (NL)

## Usage

```
$ pomp 1234AB

  Usage
    $ pomp <postcode> [--type=95]

  Options
    --type, -t   Fuel type alias or ID.

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
```
