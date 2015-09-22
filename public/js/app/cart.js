define([], function () {
	var cartStorageName = 'shoppingCart';
	var cartItems = JSON.parse(window.localStorage.getItem(cartStorageName)) || [];
	
	return {
		items: cartItems,
		addItem: function (item) {
			cartItems.push(item);
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
		removeItem: function (index) {
			cartItems.splice(index, 1);
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
		editItem: function (index, item) {
			cartItems[index] = item;
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
	};
});
