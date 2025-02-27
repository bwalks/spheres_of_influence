# Spheres of Influence Companion App
Companion webapp for [Spheres of Influence](https://littlenukegames.com/) board game. This replaces the unit tracking board and the turn hand.

This app does the following:
- Tracks which color controls each zone. Zones are linked to which sphere they belong to, so automatically tracks the number of spheres each player controls.
- Determines the number of units placed in the beginning of each round based on the resource points. Unit count is also increased by one for each sphere and capital zone controlled. Note the official rules say to increase for each STARTING capital zone, not every capital zone.
- Handles randomized turn selection, including additional turns for oil zones controlled.

## How to Use
- Select the colors for each faction in the game
- Click "Start New Game" to begin the first round.
- The turns are randomized each round
- Select a color then click on a country on the map to denote the color owning that country.
- Selecting the country again will remove the color.

Click on the number for a zone to bring up the form to change which color controls that zone. Once the zone is changed, the table below is updated to reflect the change.

[Demo](https://bwalks.github.io/spheres_of_influence)
