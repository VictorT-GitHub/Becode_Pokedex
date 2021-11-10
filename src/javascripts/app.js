const sInput = document.querySelector("#searchInput");
const sBtn = document.querySelector("#searchBtn");
const sFamiBtn = document.querySelector("#searchFamilyBtn");

// -------------------------------------------
//                 FUNCTIONS
// -------------------------------------------
function fetchPokemonSpecies(input) {
  fetch(`https://pokeapi.co/api/v2/pokemon-species/${input}/`)
    .then((res) => res.json())
    .then((data) => {
      if (
        data.evolution_chain.url ==
        "https://pokeapi.co/api/v2/evolution-chain/67/"
      ) {
        fetchEevee();
      } else {
        fetchEvoChain(data.evolution_chain.url);
      }
    })
    .catch((err) => console.log("Erreur(fetchPokemonSpecies). ", err));
}

function fetchEevee() {
  fetch(`https://pokeapi.co/api/v2/evolution-chain/67`)
    .then((res) => res.json())
    .then((data) => {
      fetchPokemon(data.chain.species.name);
      data.chain.evolves_to.forEach((elem) => fetchPokemon(elem.species.name));
    })
    .catch((err) => console.log("Erreur(fetcheevee)", err));
}

function fetchEvoChain(url) {
  fetch(`${url}`)
    .then((res) => res.json())
    .then((data) => {
      fetchPokemon(data.chain.species.name);

      if (data.chain.evolves_to[0]) {
        fetchPokemon(data.chain.evolves_to[0].species.name);

        if (data.chain.evolves_to[0].evolves_to[0]) {
          fetchPokemon(data.chain.evolves_to[0].evolves_to[0].species.name);
        }
      }
    })
    .catch((err) => console.log("Erreur(fetchEvoChain). ", err));
}

function fetchPokemon(nameorid) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${nameorid}`)
    .then((res) => res.json())
    .then((data) => {
      updateDOM(data);
    })
    .catch((err) => console.log("Erreur(fetchPokemon). ", err));
}

function updateDOM(x) {
  // Creation et placement des elements DOM
  const pokemonContainer = document.createElement("section");
  pokemonContainer.classList.add("container");

  const imgsCont = document.createElement("div");
  imgsCont.id = "imgsContainer";
  const imgFront = document.createElement("div");
  imgFront.classList.add("img");
  const imgBack = document.createElement("div");
  imgBack.classList.add("img");
  imgsCont.appendChild(imgFront);
  imgsCont.appendChild(imgBack);

  const idsCont = document.createElement("div");
  idsCont.id = "idsContainer";
  const nameh4 = document.createElement("h4");
  const idh4 = document.createElement("h4");
  idsCont.appendChild(nameh4);
  idsCont.appendChild(idh4);

  const movesCont = document.createElement("div");
  movesCont.id = "movesContainer";

  pokemonContainer.appendChild(idsCont);
  pokemonContainer.appendChild(imgsCont);
  pokemonContainer.appendChild(movesCont);

  document.querySelector("main").appendChild(pokemonContainer);

  // Images: Front & Back
  imgFront.style.background = `url(${x.sprites.front_default})`;
  imgBack.style.background = `url(${x.sprites.back_default})`;

  // Infos: ID & Name
  nameh4.textContent = `Name: ${x.name}`;
  idh4.textContent = `ID: ${x.id}`;

  // Moves: LOOP
  movesCont.innerHTML = ""; // Clear movesCont (delete all his children)
  for (let i = 0; i < 4; i += 1) {
    const move = document.createElement("h4");
    if (x.moves[i]) {
      move.textContent = x.moves[i].move.name;
      movesCont.appendChild(move);
    }
  }
}

// -------------------------------------------
//                   APP
// -------------------------------------------
// Search BTN
sBtn.addEventListener("click", () => {
  document.querySelector("main").innerHTML = ""; // Clear pokedex DOM

  fetch(`https://pokeapi.co/api/v2/pokemon/${sInput.value}/`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      updateDOM(data);

      const infosSupp = document.createElement("div");
      document.querySelector("#idsContainer").appendChild(infosSupp);

      const weighth4 = document.createElement("h4");
      weighth4.textContent = `Weight: ${data.weight}`;
      infosSupp.appendChild(weighth4);

      const heighth4 = document.createElement("h4");
      heighth4.textContent = `Height: ${data.height}`;
      infosSupp.appendChild(heighth4);

      const totalMovesh4 = document.createElement("h4");
      totalMovesh4.textContent = `Total moves: ${data.moves.length}`;
      infosSupp.appendChild(totalMovesh4);

      const typeh4 = document.createElement("h4");
      typeh4.textContent = "Type:";
      data.types.forEach(
        (type) => (typeh4.textContent += ` ${type.type.name}`)
      );
      infosSupp.appendChild(typeh4);

      data.stats.forEach((stat) => {
        const statsh4 = document.createElement("h4");
        statsh4.textContent = `Base ${stat.stat.name}: ${stat.base_stat}`;
        infosSupp.appendChild(statsh4);
      });

      // Moves: LOOP
      for (let i = 4; i < data.moves.length; i += 1) {
        const move = document.createElement("h4");
        if (data.moves[i]) {
          move.textContent = data.moves[i].move.name;
          document.querySelector("#movesContainer").appendChild(move);
        }
      }
    })
    .catch((err) => console.log("Erreur(fetchPokemon1). ", err));

  fetch(`https://pokeapi.co/api/v2/pokemon-species/${sInput.value}/`)
    .then((res) => res.json())
    .then((data) => {
      fetch(
        `https://pokeapi.co/api/v2/pokemon/${data.evolves_from_species.name}/`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          updateDOM(data);
        })
        .catch((err) => console.log("Erreur(fetchPokemon2). ", err));
    })
    .catch((err) => console.log("Erreur(fetchPokemonSpecies). ", err));

  sInput.value = ""; // Reset input value
});

// Search Family tree BTN
sFamiBtn.addEventListener("click", () => {
  document.querySelector("main").innerHTML = ""; // Clear pokedex DOM
  fetchPokemonSpecies(sInput.value); // lets start the party!
  sInput.value = ""; // Reset input value
});
