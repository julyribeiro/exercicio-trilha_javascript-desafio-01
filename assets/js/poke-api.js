
const pokeApi = {}

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default || 
                   pokeDetail.sprites.other['official-artwork'].front_default ||
                   pokeDetail.sprites.front_default

    return pokemon
}

function convertToDetailedPokemon(pokeDetail) {
    const statNames = {
        'hp': 'HP',
        'attack': 'Ataque',
        'defense': 'Defesa',
        'special-attack': 'Ataque Esp.',
        'special-defense': 'Defesa Esp.',
        'speed': 'Velocidade'
    }

    return {
        id: pokeDetail.id,
        name: pokeDetail.name,
        height: pokeDetail.height,
        weight: pokeDetail.weight,
        baseExperience: pokeDetail.base_experience,
        stats: pokeDetail.stats.map(stat => ({
            name: statNames[stat.stat.name] || stat.stat.name,
            value: stat.base_stat
        })),
        abilities: pokeDetail.abilities.map(ability => 
            ability.ability.name.replace('-', ' ')
        )
    }
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemonDetailedInfo = (pokemonId) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    return fetch(url)
        .then((response) => response.json())
        .then(convertToDetailedPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}