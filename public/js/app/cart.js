define([], function () {
	var cartStorageName = 'shoppingCart';
	var wishlistStorageName = 'shoppingCart';
	var cartItems = JSON.parse(window.localStorage.getItem(cartStorageName)) || [];
	var wishlistItems = JSON.parse(window.localStorage.getItem(wishlistStorageName)) || [];
	
	return {
		items: cartItems,
		wishlistItems: wishlistItems,
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
		addWishlistItem: function (item) {
			cartItems.push(item);
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(cartItems));
		},
		removeWishlistItem: function (index) {
			cartItems.splice(index, 1);
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(cartItems));
		},
		editWishlistItem: function (index, item) {
			cartItems[index] = item;
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(cartItems));
		},
	};
});
