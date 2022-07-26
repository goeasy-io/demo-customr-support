class RestApi {
	//用户数据示例
	users = [
		{
			uuid: '08c0a6ec-a42b-47b2-bb1e-15e0f5f9a19a',
			name: 'Mattie',
			password: '123',
			avatar: '/static/images/Avatar-1.png',
			email: 'Mattie@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '3bb179af-bcc5-4fe0-9dac-c05688484649',
			name: 'Wallace',
			password: '123',
			avatar: '/static/images/Avatar-2.png',
			email: 'Wallace@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: 'fdee46b0-4b01-4590-bdba-6586d7617f95',
			name: 'Tracy',
			password: '123',
			avatar: '/static/images/Avatar-3.png',
			email: 'Tracy@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '33c3693b-dbb0-4bc9-99c6-fa77b9eb763f',
			name: 'Juanita',
			password: '123',
			avatar: '/static/images/Avatar-4.png',
			email: 'Juanita@goeasy.io',
			phone: '138xxxxxxxx',
		},
	];
	// 店铺
	shop = [
		{
			name: 'GoEasy食品自营',
			avatar: '/static/images/shop1.png',
			id: 'shop01',
			staffs: ['6ec2c1df-24f4-4c33-a16c-d0c9de69ac09','93f76849-6db8-47f1-a68f-6e597b45179a'],
			goods: ['/static/images/goods1-1.jpg','/static/images/goods1-2.jpg','/static/images/goods1-3.jpg',]
		},
		{
			name: 'GoEasy家具生活自营',
			avatar: '/static/images/shop2.png',
			id: 'shop02',
			staffs: ['9c4ebaa6-e447-49cc-8091-34fdc25a3504','4f0b5003-c592-4469-bbe9-22180faffe7c'],
			goods: ['/static/images/goods2-1.jpg','/static/images/goods2-2.jpg','/static/images/goods2-3.jpg',]
		},
		{
			name: 'GoEasy电器自营',
			avatar: '/static/images/shop3.png',
			id: 'shop03',
			staffs: ['f51f6655-be49-4813-87ad-353b9eee971f','6c751842-545d-4da0-a203-49c31a78d202'],
			goods: ['/static/images/goods3-1.jpg','/static/images/goods3-2.jpg','/static/images/goods3-3.jpg',]
		}
	]
	// 客服
	staffs = [
		{
			uuid: '6ec2c1df-24f4-4c33-a16c-d0c9de69ac09',
			name: 'Kim',
			password: '123',
			avatar: '/static/images/Avatar-5.png',
			email: 'Kim@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '93f76849-6db8-47f1-a68f-6e597b45179a',
			name: 'Molly',
			password: '123',
			avatar: '/static/images/Avatar-6.png',
			email: 'Molly@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '9c4ebaa6-e447-49cc-8091-34fdc25a3504',
			name: 'Harry',
			password: '123',
			avatar: '/static/images/Avatar-7.png',
			email: 'Harry@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '4f0b5003-c592-4469-bbe9-22180faffe7c',
			name: 'Lara',
			password: '123',
			avatar: '/static/images/Avatar-8.png',
			email: 'Lara@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: 'f51f6655-be49-4813-87ad-353b9eee971f',
			name: 'Leo',
			password: '123',
			avatar: '/static/images/Avatar-9.png',
			email: 'Leo@goeasy.io',
			phone: '138xxxxxxxx',
		},
		{
			uuid: '6c751842-545d-4da0-a203-49c31a78d202',
			name: 'Belle',
			password: '123',
			avatar: '/static/images/Avatar-10.png',
			email: 'Belle@goeasy.io',
			phone: '138xxxxxxxx',
		}
	];
	orders = [
		{
			url: '/static/images/goods1-1.jpg',
			name: '青桔柠檬气泡美式',
			price: '￥23',
			sales: 165
		},
		{
			url: '/static/images/goods1-2.jpg',
			name: '咸柠七',
			price: '￥8',
			sales: 386
		},
		{
			url: '/static/images/goods1-3.jpg',
			name: '黑糖波波鲜奶茶',
			price: '￥12',
			sales: 258
		}
	]

	findFriends (id) {
		return this.users.filter((v) => v.uuid !== id);
	}

	findUser (username, password) {
		return this.users.find((user) => user.name === username && user.password === password);
	}

	findStaffs () {
		return this.staffs
	}

	findShopByStaff (staffId) {
		return this.shop.find((shop) => shop.staffs.indexOf(staffId) !== -1);
	}

	getOrderList () {
		return this.orders;
	}

	findStaff (username, password) {
		return this.staffs.find((user) => user.name === username && user.password === password);
	}

	findUserById (userId) {
		return this.users.find((user) => user.uuid === userId);
	}
}

export default new RestApi();
