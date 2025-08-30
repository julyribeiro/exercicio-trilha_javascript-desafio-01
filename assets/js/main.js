const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const searchInput = document.getElementById('searchInput')
const clearSearch = document.getElementById('clearSearch')
const typeFilter = document.getElementById('typeFilter')
const generationFilter = document.getElementById('generationFilter')
const totalPokemonSpan = document.getElementById('totalPokemon')
const shownPokemonSpan = document.getElementById('shownPokemon')
const noResults = document.getElementById('noResults')
const pokemonModal = document.getElementById('pokemonModal')
const modalContent = document.getElementById('modalContent')
const closeModal = document.getElementById('closeModal')
const loader = document.getElementById('loader')

const maxRecords = 151
const limit = 20
let offset = 0
let allPokemons = []
let filteredPokemons = []


window.addEventListener('load', () => {
    setTimeout(() => {
        loader.style.opacity = '0'
        setTimeout(() => {
            loader.style.display = 'none'
        }, 500)
    }, 1000)
})


const typeTranslations = {
    'normal': 'Normal', 'fire': 'Fogo', 'water': 'Água', 'electric': 'Elétrico',
    'grass': 'Grama', 'ice': 'Gelo', 'fighting': 'Lutador', 'poison': 'Venenoso',
    'ground': 'Terra', 'flying': 'Voador', 'psychic': 'Psíquico', 'bug': 'Inseto',
    'rock': 'Pedra', 'ghost': 'Fantasma', 'dragon': 'Dragão', 'dark': 'Sombrio',
    'steel': 'Aço', 'fairy': 'Fada'
}

function convertPokemonToLi(pokemon) {
    const translatedTypes = pokemon.types.map(type => 
        typeTranslations[type] || type
    )
    
    return `
        <li class="pokemon ${pokemon.type}" data-pokemon='${JSON.stringify(pokemon)}'>
            <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type, index) => 
                        `<li class="type ${type}">${translatedTypes[index]}</li>`
                    ).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}" loading="lazy">
            </div>
        </li>
    `
}

function updateStats() {
    totalPokemonSpan.textContent = allPokemons.length
    shownPokemonSpan.textContent = filteredPokemons.length
}

function filterPokemons() {
    const searchTerm = searchInput.value.toLowerCase().trim()
    const selectedType = typeFilter.value
    const selectedGeneration = generationFilter.value

    filteredPokemons = allPokemons.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) || 
                            pokemon.number.toString().includes(searchTerm)
        const matchesType = !selectedType || pokemon.types.includes(selectedType)
        const matchesGeneration = !selectedGeneration || 
                                (selectedGeneration === '1' && pokemon.number <= 151)

        return matchesSearch && matchesType && matchesGeneration
    })

    renderFilteredPokemons()
    updateStats()
}

function renderFilteredPokemons() {
    if (filteredPokemons.length === 0) {
        pokemonList.innerHTML = ''
        noResults.style.display = 'block'
        return
    }

    noResults.style.display = 'none'
    const newHtml = filteredPokemons.map(convertPokemonToLi).join('')
    pokemonList.innerHTML = newHtml

    
    document.querySelectorAll('.pokemon').forEach(card => {
        card.addEventListener('click', () => {
            const pokemon = JSON.parse(card.dataset.pokemon)
            showPokemonDetails(pokemon)
        })
    })
}

async function showPokemonDetails(pokemon) {
    try {
        const detailedPokemon = await pokeApi.getPokemonDetailedInfo(pokemon.number)
        
        const modalHtml = `
            <div class="pokemon-detail-header ${pokemon.type}">
                <h2>${pokemon.name}</h2>
                <span class="pokemon-number">#${pokemon.number.toString().padStart(3, '0')}</span>
                <img src="${pokemon.photo}" alt="${pokemon.name}" class="pokemon-detail-image">
            </div>
            
            <div class="pokemon-detail-content">
                <div class="pokemon-types">
                    <h3>Tipos</h3>
                    <div class="types-list">
                        ${pokemon.types.map(type => 
                            `<span class="type-badge ${type}">${typeTranslations[type] || type}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="pokemon-stats">
                    <h3>Estatísticas Base</h3>
                    <div class="stats-grid">
                        ${detailedPokemon.stats.map(stat => `
                            <div class="stat-item">
                                <span class="stat-name">${stat.name}</span>
                                <div class="stat-bar">
                                    <div class="stat-fill" style="width: ${(stat.value / 255) * 100}%"></div>
                                </div>
                                <span class="stat-value">${stat.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="pokemon-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Altura:</strong> ${detailedPokemon.height / 10} m
                        </div>
                        <div class="info-item">
                            <strong>Peso:</strong> ${detailedPokemon.weight / 10} kg
                        </div>
                        <div class="info-item">
                            <strong>Experiência Base:</strong> ${detailedPokemon.baseExperience}
                        </div>
                    </div>
                </div>

                <div class="pokemon-abilities">
                    <h3>Habilidades</h3>
                    <div class="abilities-list">
                        ${detailedPokemon.abilities.map(ability => 
                            `<span class="ability-badge">${ability}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `
        
        modalContent.innerHTML = modalHtml
        pokemonModal.classList.add('active')
        document.body.style.overflow = 'hidden'
        
    } catch (error) {
        console.error('Error loading Pokemon details:', error)
        modalContent.innerHTML = `
            <div class="error-message">
                <h3>Erro ao carregar detalhes</h3>
                <p>Não foi possível carregar as informações deste Pokémon.</p>
            </div>
        `
        pokemonModal.classList.add('active')
    }
}

function closeModalHandler() {
    pokemonModal.classList.remove('active')
    document.body.style.overflow = 'auto'
}

async function loadPokemonItens(offset, limit) {
    loadMoreButton.disabled = true
    loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...'
    
    try {
        const pokemons = await pokeApi.getPokemons(offset, limit)
        allPokemons = allPokemons.concat(pokemons)
        filterPokemons()
    } catch (error) {
        console.error('Error loading Pokemon:', error)
    } finally {
        loadMoreButton.disabled = false
        loadMoreButton.innerHTML = '<i class="fas fa-plus"></i> Carregar mais Pokémon'
    }
}

searchInput.addEventListener('input', filterPokemons)
typeFilter.addEventListener('change', filterPokemons)
generationFilter.addEventListener('change', filterPokemons)

clearSearch.addEventListener('click', () => {
    searchInput.value = ''
    filterPokemons()
})

closeModal.addEventListener('click', closeModalHandler)

pokemonModal.addEventListener('click', (e) => {
    if (e.target === pokemonModal) {
        closeModalHandler()
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pokemonModal.classList.contains('active')) {
        closeModalHandler()
    }
})

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)
        loadMoreButton.style.display = 'none'
    } else {
        loadPokemonItens(offset, limit)
    }
})

loadPokemonItens(offset, limit)