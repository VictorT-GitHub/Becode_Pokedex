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

async function fetchEevee() {
  let stockedData;

  await fetch(`https://pokeapi.co/api/v2/evolution-chain/67`)
    .then((res) => res.json())
    .then((data) => (stockedData = data))
    .catch((err) => console.log("Erreur(fetcheevee)", err));

  await fetchPokemon(stockedData.chain.species.name);

  stockedData.chain.evolves_to.forEach((elem) =>
    fetchPokemon(elem.species.name)
  );
}

async function fetchEvoChain(url) {
  let stockedData;

  await fetch(`${url}`)
    .then((res) => res.json())
    .then((data) => (stockedData = data))
    .catch((err) => console.log("Erreur(fetchEvoChain). ", err));

  await fetchPokemon(stockedData.chain.species.name);

  if (stockedData.chain.evolves_to[0]) {
    await fetchPokemon(stockedData.chain.evolves_to[0].species.name);

    if (stockedData.chain.evolves_to[0].evolves_to[0]) {
      fetchPokemon(stockedData.chain.evolves_to[0].evolves_to[0].species.name);
    }
  }
}

function fetchPokemon(nameorid) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${nameorid}`)
    .then((res) => res.json())
    .then((data) => {
      updateDOM(data);
    })
    .catch((err) => console.log("Erreur(fetchPokemon). ", err));
}

// ------ Search Family tree CLICK ------
function famiTreeClick(x) {
  document.querySelector("main").innerHTML = ""; // Clear pokedex DOM
  fetchPokemonSpecies(x); // lets start the fetch party!
  sInput.value = ""; // Reset input value
}

// ------ Search Pokemon-infos CLICK ------
function pokemonClick(x) {
  document.querySelector("main").innerHTML = ""; // Clear pokedex DOM
  // fetchPokemon with more informations
  fetch(`https://pokeapi.co/api/v2/pokemon/${x}/`)
    .then((res) => res.json())
    .then((data) => {
      updateDOM(data);
      infosSuppDOM(data);

      // fetchPokemon-Species -> fetchPokemon (get the evolves_from pokemon)
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${x}/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.evolves_from_species !== null) {
            fetchPokemon(data.evolves_from_species.name);
          }
        })
        .catch((err) => console.log("Erreur(fetchPokemonSpecies). ", err));
    })
    .catch((err) => console.log("Erreur(fetchPokemon1). ", err));
  sInput.value = ""; // Reset input value
}

// ------ Creation et placement des elements DOM ------
function updateDOM(x) {
  // ------ Images: Front & Back ------
  const imgFront = document.createElement("div");
  imgFront.classList.add("img");
  imgFront.style.background = `url(${x.sprites.front_default})`;

  const imgBack = document.createElement("div");
  imgBack.classList.add("img");
  imgBack.style.background = `url(${x.sprites.back_default})`;

  const imgsCont = document.createElement("div");
  imgsCont.id = "imgsContainer";
  imgsCont.appendChild(imgFront);
  imgsCont.appendChild(imgBack);
  imgsCont.addEventListener("click", () => pokemonClick(x.name));

  // ------ Infos: ID & Name ------
  const nameh4 = document.createElement("h4");
  nameh4.textContent = `Name: ${x.name}`;

  const idh4 = document.createElement("h4");
  idh4.textContent = `ID: ${x.id}`;

  const idsCont = document.createElement("div");
  idsCont.id = "idsContainer";
  idsCont.appendChild(nameh4);
  idsCont.appendChild(idh4);
  idsCont.addEventListener("click", () => pokemonClick(x.name));

  // ------ Moves: LOOP ------
  const movesCont = document.createElement("div");
  movesCont.id = "movesContainer";
  for (let i = 0; i < 4; i += 1) {
    const move = document.createElement("h4");
    if (x.moves[i]) {
      move.textContent = x.moves[i].move.name;
      movesCont.appendChild(move);
    }
  }
  movesCont.addEventListener("click", () => pokemonClick(x.name));

  // ------ Pokemon Container ------
  const pokemonContainer = document.createElement("section");
  pokemonContainer.id = x.name;
  pokemonContainer.classList.add("container");
  pokemonContainer.appendChild(idsCont);
  pokemonContainer.appendChild(imgsCont);
  pokemonContainer.appendChild(movesCont);
  document.querySelector("main").appendChild(pokemonContainer);
}

function infosSuppDOM(x) {
  const idsCont = document.querySelector("#idsContainer");
  const imgsCont = document.querySelector("#imgsContainer");
  const movesCont = document.querySelector("#movesContainer");

  const weighth4 = document.createElement("h4");
  weighth4.textContent = `Weight: ${x.weight}`;
  idsCont.appendChild(weighth4);

  const heighth4 = document.createElement("h4");
  heighth4.textContent = `Height: ${x.height}`;
  idsCont.appendChild(heighth4);

  const totalMovesh4 = document.createElement("h4");
  totalMovesh4.textContent = `Total moves: ${x.moves.length}`;
  idsCont.appendChild(totalMovesh4);

  const typeh4 = document.createElement("h4");
  typeh4.textContent = "Type:";
  x.types.forEach((type) => (typeh4.textContent += ` ${type.type.name}`));
  idsCont.appendChild(typeh4);

  x.stats.forEach((stat) => {
    const statsh4 = document.createElement("h4");
    statsh4.textContent = `Base ${stat.stat.name}: ${stat.base_stat}`;
    idsCont.appendChild(statsh4);
  });

  // Moves: LOOP (reprend là où s'était arrêter la dernière loop)
  for (let i = 4; i < x.moves.length; i += 1) {
    const move = document.createElement("h4");
    if (x.moves[i]) {
      move.textContent = x.moves[i].move.name;
      movesCont.appendChild(move);
    }
  }

  // CONTAINERS EventListeners (CloneNode a element = Delete ALL eventListeners on this element)
  imgsCont.replaceWith(imgsCont.cloneNode(true));
  document
    .querySelector("#imgsContainer")
    .addEventListener("click", () => famiTreeClick(x.name));

  idsCont.replaceWith(idsCont.cloneNode(true));
  document
    .querySelector("#idsContainer")
    .addEventListener("click", () => famiTreeClick(x.name));

  movesCont.replaceWith(movesCont.cloneNode(true));
  document
    .querySelector("#movesContainer")
    .addEventListener("click", () => famiTreeClick(x.name));
}

// -------------------------------------------
//                   APP
// -------------------------------------------
sInput.value = ""; // Reset input value at page opening/reloading

// ------ Search BTN ------
sBtn.addEventListener("click", () => {
  if (sInput.value) {
    document.querySelector("main").innerHTML = ""; // Clear pokedex DOM

    // fetchPokemon with more informations
    fetch(`https://pokeapi.co/api/v2/pokemon/${sInput.value}/`)
      .then((res) => res.json())
      .then((data) => {
        updateDOM(data);
        infosSuppDOM(data);

        // fetchPokemon-Species -> fetchPokemon (get the evolves_from pokemon)
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${sInput.value}/`)
          .then((res) => res.json())
          .then((data) => {
            if (data.evolves_from_species !== null) {
              fetchPokemon(data.evolves_from_species.name);
            }
          })
          .catch((err) => console.log("Erreur(fetchPokemonSpecies). ", err));
      })
      .catch((err) => console.log("Erreur(fetchPokemon1). ", err));
  }
});

// ------ Search Family tree BTN ------
sFamiBtn.addEventListener("click", () => {
  if (sInput.value) {
    document.querySelector("main").innerHTML = ""; // Clear pokedex DOM
    fetchPokemonSpecies(sInput.value); // lets start the fetch party!
  }
});
