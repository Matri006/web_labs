const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const API_KEY = '6d6ddfc6-d9b7-4f06-afe9-f6cd1194c183'; //


let selectedDishes = {
    soup: null,
    "main-course": null,
    drink: null,
    salad: null,
    dessert: null
};

let dishesData = {}; 
let allDishes = [];
function saveOrderToStorage() {
    const orderToSave = {
        selectedDishes: selectedDishes,
        dishesData: dishesData 
    };
    localStorage.setItem('foodConstructOrder', JSON.stringify(orderToSave));
}
function loadOrderFromStorage() {
    const savedOrder = localStorage.getItem('foodConstructOrder');
    if (savedOrder) {
        const orderData = JSON.parse(savedOrder);
        selectedDishes = orderData.selectedDishes || {
            soup: null,
            "main-course": null,
            drink: null,
            salad: null,
            dessert: null
        };
        dishesData = orderData.dishesData || {};
        return selectedDishes;
    }
    return {
        soup: null,
        "main-course": null,
        drink: null,
        salad: null,
        dessert: null
    };
}
function initializeOrder() {
    loadOrderFromStorage();
    updateOrderDisplay();
    if (typeof updateOrderPanel === 'function') {
        updateOrderPanel();
    }
}

function addToOrder(dishData) {
    console.log('Добавление блюда:', dishData);
    if (selectedDishes[dishData.category] === dishData.id) {
        selectedDishes[dishData.category] = null;
    } else {
        selectedDishes[dishData.category] = dishData.id;
        dishesData[dishData.id] = dishData;
    }
    
    updateOrderDisplay();
    saveOrderToStorage();
    
    if (typeof updateOrderPanel === 'function') {
        updateOrderPanel();
    }
    updateDishCardsDisplay();
}

function updateOrderDisplay() {
    console.log('Текущий заказ:', selectedDishes);
}

function updateDishCardsDisplay() {
    const allDishCards = document.querySelectorAll('.dish');
    allDishCards.forEach(card => {
        const dishId = card.getAttribute('data-dish-id');
        const category = getDishCategory(card);
        
        if (selectedDishes[category] == dishId) {
            card.classList.add('selected');
            const button = card.querySelector('.add-btn');
            if (button) {
                button.textContent = 'Выбрано';
                button.style.backgroundColor = '#4CAF50';
            }
        } else {
            card.classList.remove('selected');
            const button = card.querySelector('.add-btn');
            if (button) {
                button.textContent = 'Добавить';
                button.style.backgroundColor = '';
            }
        }
    });
}

function getDishCategory(dishCard) {
    const section = dishCard.closest('section');
    
    if (section.id === 'soups') return 'soup';
    if (section.id === 'mains') return 'main-course';
    if (section.id === 'drinks') return 'drink';
    if (section.id === 'salad-order') return 'salad';
    if (section.id === 'dessert-order') return 'dessert';
    
    return 'unknown';
}

function resetOrder() {
    selectedDishes = {
        soup: null,
        "main-course": null,
        drink: null,
        salad: null,
        dessert: null
    };
    dishesData = {};
    updateOrderDisplay();
    localStorage.removeItem('foodConstructOrder');
    
    if (typeof updateOrderPanel === 'function') {
        updateOrderPanel();
    }
    
    updateDishCardsDisplay();
}
function validateCombo(order) {
    const hasSoup = !!order.soup;
    const hasMain = !!order["main-course"];
    const hasSalad = !!order.salad;
    const hasDrink = !!order.drink;

    const validCombos = [
        { soup: true, main: true, salad: true, drink: true },
        { soup: true, main: true, salad: false, drink: true },
        { soup: true, main: false, salad: true, drink: true },
        { soup: false, main: true, salad: true, drink: true },
        { soup: false, main: true, salad: false, drink: true }
    ];

    return validCombos.some(combo => 
        combo.soup === hasSoup &&
        combo.main === hasMain &&
        combo.salad === hasSalad &&
        combo.drink === hasDrink
    );
}
function getSelectedDishesData() {
    const selectedData = {};
    let total = 0;
    
    Object.keys(selectedDishes).forEach(category => {
        const dishId = selectedDishes[category];
        if (dishId && dishesData[dishId]) {
            selectedData[category] = dishesData[dishId];
            total += parseInt(dishesData[dishId].price);
        }
    });
    
    return { dishes: selectedData, total };
}

async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error("Ошибка при загрузке данных с сервера");
        }

        const dishes = await response.json();
        allDishes = dishes;
        
        const sections = {
            soup: document.querySelector("#soups .dishes-grid"),
            "main-course": document.querySelector("#mains .dishes-grid"),
            drink: document.querySelector("#drinks .dishes-grid"),
            salad: document.querySelector("#salad-order .dishes-grid"),
            dessert: document.querySelector("#dessert-order .dishes-grid")
        };
        Object.values(sections).forEach(section => {
            if (section) section.innerHTML = "";
        });
        dishes.forEach(dish => {
            const category = dish.category;
            const section = sections[category];
            
            if (!section) {
                console.warn(`Неизвестная категория: ${category} для блюда ${dish.name}`);
                return;
            }

            const dishCard = document.createElement("div");
            dishCard.classList.add("dish");
            dishCard.dataset.category = category;
            dishCard.dataset.kind = dish.kind || 'all';
            dishCard.setAttribute('data-dish-id', dish.id);
            
            dishCard.innerHTML = `
                <img src="${dish.image}?v=${Date.now()}" alt="${dish.name}" class="dish-img" 
                     onerror="this.src='./images/placeholder.jpg'">
                <div class="dish-body">
                    <h3 class="dish-title">${dish.name}</h3>
                    <p class="dish-weight">${dish.count}</p>
                    <p class="dish-price">${dish.price} ₽</p>
                    <button class="add-btn">Добавить</button>
                </div>
            `;
            dishesData[dish.id] = {
                id: dish.id,
                title: dish.name,
                price: dish.price,
                weight: dish.count,
                category: category,
                image: dish.image,
                name: dish.name,
                count: dish.count
            };

            section.appendChild(dishCard);
            dishCard.querySelector(".add-btn").addEventListener("click", () => {
                addToOrder(dishesData[dish.id]);
            });
        });
        initializeFilters();
        updateDishCardsDisplay();
        
        console.log("Блюда успешно загружены:", dishes);
        console.log("Текущий заказ:", selectedDishes);
    } catch (error) {
        console.error("Ошибка загрузки блюд:", error);
        alert('Ошибка загрузки меню. Пожалуйста, обновите страницу.');
    }
}
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.dishes-section');
            const filterValue = this.getAttribute('data-filter');
            section.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            filterDishes(section, filterValue);
        });
    });
}

function filterDishes(section, filter) {
    const dishes = section.querySelectorAll('.dish');
    
    dishes.forEach(dish => {
        const dishKind = dish.getAttribute('data-kind') || 'all';
        
        if (filter === 'all' || dishKind === filter) {
            dish.style.display = 'block';
        } else {
            dish.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    initializeOrder();
    await loadDishes();
    const resetButton = document.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите очистить заказ?')) {
                resetOrder();
            }
        });
    }
});