define([], function () {
	return  function (gridConfig, backdropStates) {
		return function (stream, options, multiple) {
			return grid(gridConfig, options.map(function (option, i) {
				var states = backdropStates(option.component);
				return toggleComponent([
					states.selected.all([
						link,
						clickThis(function () {
							if (multiple) {
								var oldArray = stream.lastValue() || [];
								var index = oldArray.indexOf(option.value);
								if (index !== -1) {
									var arr = oldArray.slice(0);
									arr.splice(index, 1);
									stream.push(arr);
								}
							}
						}),
					]),
					states.deselected.all([
						link,
						clickThis(function () {
							if (multiple) {
								var oldArray = stream.lastValue() || [];
								var index = oldArray.indexOf(option.value);
								if (index === -1) {
									stream.push(oldArray.concat([option.value]));
								}
							}
							else {
								stream.push(option.value);
							}
						}),
					]),
				], stream.map(function (v) {
					if (multiple) {
						return v.filter(function (v) {
							return v === options[i].value;
						}).length > 0 ? 0 : 1;
					}
					else {
						return v === options[i].value ? 0 : 1;
					}
				}));
			}));
		};
	};
});
