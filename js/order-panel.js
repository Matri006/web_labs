function updateOrderPanel() {
    const orderPanel = document.getElementById('order-panel');
    const currentTotal = document.getElementById('current-total');
    const checkoutLink = document.getElementById('checkout-link');
    
    if (!orderPanel || !currentTotal || !checkoutLink) return;

    const { total } = getSelectedDishesData();
    const hasItems = total > 0;
    const isValidCombo = validateCombo(selectedDishes);

    if (hasItems) {
        orderPanel.style.display = 'block';
        currentTotal.textContent = total;
        if (isValidCombo) {
            checkoutLink.style.opacity = '1';
            checkoutLink.style.pointerEvents = 'all';
            checkoutLink.classList.remove('disabled');
        } else {
            checkoutLink.style.opacity = '0.5';
            checkoutLink.style.pointerEvents = 'none';
            checkoutLink.classList.add('disabled');
        }
    } else {
        orderPanel.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateOrderPanel, 100);
    window.addEventListener('storage', function(e) {
        if (e.key === 'foodConstructOrder') {
            initializeOrder();
            updateOrderPanel();
        }
    });
});