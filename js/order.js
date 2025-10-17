function createDishCard(dish) {
    const dishElement = document.createElement('div');
    dishElement.className = 'dish';
    dishElement.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <div class="dish-body">
            <p class="dish-price">${dish.price} ₽</p>
            <p class="dish-title">${dish.name}</p>
            <p class="dish-weight">${dish.count}</p>
            <button class="add-btn" data-keyword="${dish.keyword}">Добавить</button>
        </div>
    `;
    return dishElement;
}

function loadDishes() {
    console.log('Загрузка блюд...', dishesData);
    if (!dishesData) {
        console.error('dishesData не определен');
        return;
    }

    if (typeof dishesData === 'object' && !Array.isArray(dishesData)) {

        console.log('Объект с категориями:', Object.keys(dishesData));

        const soupsGrid = document.querySelector('#soups .dishes-grid');
        if (soupsGrid && dishesData.soups) {
            console.log('Супы:', dishesData.soups);
            dishesData.soups.forEach(soup => {
                soupsGrid.appendChild(createDishCard(soup));
            });
        }

        const mainsGrid = document.querySelector('#mains .dishes-grid');
        if (mainsGrid && dishesData.main) {
            console.log('Основные блюда:', dishesData.main);
            dishesData.main.forEach(mainDish => { 
                mainsGrid.appendChild(createDishCard(mainDish));
            });
        }
        const drinksGrid = document.querySelector('#drinks .dishes-grid');
        if (drinksGrid && dishesData.drinks) {
            console.log('Напитки:', dishesData.drinks);
            dishesData.drinks.forEach(drink => {
                drinksGrid.appendChild(createDishCard(drink));
            });
        }
    } else if (Array.isArray(dishesData)) {
        console.log('Массив блюд:', dishesData);
        const soupsGrid = document.querySelector('#soups .dishes-grid');
        if (soupsGrid) {
            const soups = dishesData.filter(dish => dish.category === 'soup');
            console.log('Супы:', soups);
            soups.forEach(soup => {
                soupsGrid.appendChild(createDishCard(soup));
            });
        }
        const mainsGrid = document.querySelector('#mains .dishes-grid');
        if (mainsGrid) {
            const mains = dishesData.filter(dish => dish.category === 'main');
            console.log('Основные блюда:', mains);
            mains.forEach(main => {
                mainsGrid.appendChild(createDishCard(main));
            });
        }
        const drinksGrid = document.querySelector('#drinks .dishes-grid');
        if (drinksGrid) {
            const drinks = dishesData.filter(dish => dish.category === 'drink');
            console.log('Напитки:', drinks);
            drinks.forEach(drink => {
                drinksGrid.appendChild(createDishCard(drink));
            });
        }
    } else {
        console.error('Неизвестная структура данных dishesData:', dishesData);
    }
    addEventListeners();
}

function addEventListeners() {
    const addButtons = document.querySelectorAll('.add-btn');
    console.log('Найдено кнопок:', addButtons.length);
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dishKeyword = this.getAttribute('data-keyword');
            console.log('Клик по блюду:', dishKeyword);
            addToLunch(dishKeyword);
        });
    });
}
function addToLunch(dishKeyword) {
    let dish;
    
    if (Array.isArray(dishesData)) {
        dish = dishesData.find(item => item.keyword === dishKeyword);
    } else if (typeof dishesData === 'object') {
        const allDishes = [
            ...(dishesData.soups || []), 
            ...(dishesData.main || []),
            ...(dishesData.drinks || [])
        ];
        dish = allDishes.find(item => item.keyword === dishKeyword);
    }
    
    console.log('Найдено блюдо:', dish);

    if (dish) {
        alert(`Добавлено: ${dish.name} - ${dish.price} ₽`);
        const button = document.querySelector(`.add-btn[data-keyword="${dishKeyword}"]`);
        if (button) {
            button.textContent = 'Добавлено';
            button.disabled = true;
            button.style.backgroundColor = '#28a745';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    loadDishes();
});