let selectedDishes = {
    soup: null,
    main: null,
    drink: null,
    salad: null, 
    dessert: null
};
function addToOrder(dishData) {
    dishesData[dishData.id] = dishData;
    selectedDishes[dishData.category] = dishData.id;
    updateOrderDisplay();
    updateFormFields();
}
function updateOrderDisplay() {
    let total = 0;
    let hasSelection = false;
    const soupElement = document.getElementById('soup');
    const soupHidden = document.getElementById('BuySoup');
    if (selectedDishes.soup && dishesData[selectedDishes.soup]) {
        const soupData = dishesData[selectedDishes.soup];
        const price = parseInt(soupData.price.replace('₽', '').trim());
        soupElement.textContent = `${soupData.title} ${soupData.price}`;
        soupHidden.value = `${soupData.title} ${soupData.price}`;
        total += price;
        hasSelection = true;
    } else {
        soupElement.textContent = 'Блюдо не выбрано';
        soupHidden.value = 'none';
    }
    const mainElement = document.getElementById('bludo');
    const mainHidden = document.getElementById('BuyMain');
    if (selectedDishes.main && dishesData[selectedDishes.main]) {
        const mainData = dishesData[selectedDishes.main];
        const price = parseInt(mainData.price.replace('₽', '').trim());
        mainElement.textContent = `${mainData.title} ${mainData.price}`;
        mainHidden.value = `${mainData.title} ${mainData.price}`;
        total += price;
        hasSelection = true;
    } else {
        mainElement.textContent = 'Блюдо не выбрано';
        mainHidden.value = 'none';
    }
    const drinkElement = document.getElementById('drink');
    const drinkHidden = document.getElementById('BuyDrink');
    if (selectedDishes.drink && dishesData[selectedDishes.drink]) {
        const drinkData = dishesData[selectedDishes.drink];
        const price = parseInt(drinkData.price.replace('₽', '').trim());
        drinkElement.textContent = `${drinkData.title} ${drinkData.price}`;
        drinkHidden.value = `${drinkData.title} ${drinkData.price}`;
        total += price;
        hasSelection = true;
    } else {
        drinkElement.textContent = 'Напиток не выбран';
        drinkHidden.value = 'none';
    }
    const saladElement = document.getElementById('salad'); 
    const saladHidden = document.getElementById('BuySalad');
    if (selectedDishes.salad && dishesData[selectedDishes.salad]) {
        const saladData = dishesData[selectedDishes.salad];
        const price = parseInt(saladData.price.replace('₽', '').trim());
        saladElement.textContent = `${saladData.title} ${saladData.price}`;
        saladHidden.value = `${saladData.title} ${saladData.price}`;
        total += price;
        hasSelection = true;
    } else {
        saladElement.textContent = 'Салат не выбран';
        saladHidden.value = 'none';
    }
    const dessertElement = document.getElementById('dessert'); 
    const dessertHidden = document.getElementById('BuyDessert'); 
    if (selectedDishes.dessert && dishesData[selectedDishes.dessert]) {
        const dessertData = dishesData[selectedDishes.dessert];
        const price = parseInt(dessertData.price.replace('₽', '').trim());
        dessertElement.textContent = `${dessertData.title} ${dessertData.price}`;
        dessertHidden.value = `${dessertData.title} ${dessertData.price}`;
        total += price;
        hasSelection = true;
    } else {
        dessertElement.textContent = 'Десерт не выбран';
        dessertHidden.value = 'none';
    }
    const nanElement = document.getElementById('nan');
    nanElement.textContent = hasSelection ? '' : 'Ничего не выбрано';
    const costElement = document.getElementById('cost');
    const costHidden = document.getElementById('BuyCost');
    costElement.textContent = `${total} р`;
    costHidden.value = `${total} р`;
}
function updateFormFields() {
}

function initializeAddToCartButtons() {
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dishCard = this.closest('.dish');
            const dishData = {
                id: generateDishId(dishCard),
                title: dishCard.querySelector('.dish-title').textContent,
                price: dishCard.querySelector('.dish-price').textContent,
                weight: dishCard.querySelector('.dish-weight').textContent,
                category: getDishCategory(dishCard)
            };
            addToOrder(dishData);
        });
    });
}
function generateDishId(dishCard) {
    const title = dishCard.querySelector('.dish-title').textContent;
    return title.toLowerCase().replace(/\s+/g, '-');
}
function getDishCategory(dishCard) {
    const section = dishCard.closest('section');
    
    if (section.id === 'soups') return 'soup';
    if (section.id === 'mains') return 'main';
    if (section.id === 'drinks') return 'drink';
    if(section.id === 'salad-order') return 'salad';
    if(section.id === 'dessert-order') return 'dessert';
    
    return 'unknown';
}
function resetOrder() {
    selectedDishes = {
        soup: null,
        main: null,
        drink: null,
        salad: null,
        dessert: null
    };
    dishesData = {};
    updateOrderDisplay();
}




function validateForm() {
    if (!selectedDishes.soup && !selectedDishes.main && !selectedDishes.drink && 
        !selectedDishes.salad && !selectedDishes.dessert) { 
        alert('Пожалуйста, выберите хотя бы одно блюдо перед оформлением заказа');
        return false;
    }
    const deliveryTimeOption = document.querySelector('input[name="delivery_time_option"]:checked');
    if (!deliveryTimeOption) {
        alert('Пожалуйста, выберите время доставки');
        return false;
    }
    if (deliveryTimeOption.value === 'specified') {
        const timeInput = document.getElementById('time');
        if (!timeInput.value) {
            alert('Пожалуйста, укажите время доставки');
            return false;
        }
    }
    
    return true;
}
document.addEventListener('DOMContentLoaded', function() {
    initializeAddToCartButtons();
    const resetButton = document.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            setTimeout(() => {
                resetOrder();
            }, 0);
        });
    }
    const form = document.getElementById('form');
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
        console.log('Данные заказа:', {
            soup: document.getElementById('BuySoup').value,
            main: document.getElementById('BuyMain').value,
            drink: document.getElementById('BuyDrink').value,
            total: document.getElementById('BuyCost').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('PhoneNumber').value,
            address: document.getElementById('address').value,
            delivery_time: document.querySelector('input[name="delivery_time_option"]:checked').value,
            specific_time: document.getElementById('time').value,
            promotion: document.getElementById('promotion').checked,
            comment: document.getElementById('comments').value
        });
    });
    updateOrderDisplay();
});