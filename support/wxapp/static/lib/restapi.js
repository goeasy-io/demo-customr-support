class RestApi {
    //用户数据示例
    customers = [
        {
            id: '3f99d89d-99c0-44f7-96c9-e4c6ff5ac4d2',
            name: 'Mattie',
            password: '123',
            avatar: '/static/images/Avatar-1.png',
            email: 'Mattie@goeasy.io',
            phone: '138xxxxxxxx',
        },
        {
            id: '413985eb-c120-41ab-baea-93c3e751a14a',
            name: 'Wallace',
            password: '123',
            avatar: '/static/images/Avatar-2.png',
            email: 'Wallace@goeasy.io',
            phone: '138xxxxxxxx',
        },
        {
            id: 'ce525fb0-99db-4e1a-bdac-1d09911cae7f',
            name: 'Tracy',
            password: '123',
            avatar: '/static/images/Avatar-3.png',
            email: 'Tracy@goeasy.io',
            phone: '138xxxxxxxx',
        },
        {
            id: '68663b2b-d824-46e9-983a-24cc2ab22df6',
            name: 'Juanita',
            password: '123',
            avatar: '/static/images/Avatar-4.png',
            email: 'Juanita@goeasy.io',
            phone: '138xxxxxxxx',
        },
    ];
    // 店铺
    shops = [
        {
            name: 'GoEasy食品自营',
            avatar: '/static/images/shop1.png',
            id: 'shop01',
            goods: ['/static/images/goods1-1.jpg', '/static/images/goods1-2.jpg', '/static/images/goods1-3.jpg',]
        },
        {
            name: 'GoEasy家具生活自营',
            avatar: '/static/images/shop2.png',
            id: 'shop02',
            goods: ['/static/images/goods2-1.jpg', '/static/images/goods2-2.jpg', '/static/images/goods2-3.jpg',]
        },
        {
            name: 'GoEasy电器自营',
            avatar: '/static/images/shop3.png',
            id: 'shop03',
            goods: ['/static/images/goods3-1.jpg', '/static/images/goods3-2.jpg', '/static/images/goods3-3.jpg',]
        }
    ];
    // 客服代表
    agents = [
        {
            id: '6ec2c1df-24f4-4c33-a16c-d0c9de69ac09',
            name: 'Kim',
            password: '123',
            avatar: '/static/images/Avatar-5.png',
            email: 'Kim@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop01'
        },
        {
            id: '93f76849-6db8-47f1-a68f-6e597b45179a',
            name: 'Molly',
            password: '123',
            avatar: '/static/images/Avatar-6.png',
            email: 'Molly@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop01'
        },
        {
            id: '9c4ebaa6-e447-49cc-8091-34fdc25a3504',
            name: 'Harry',
            password: '123',
            avatar: '/static/images/Avatar-7.png',
            email: 'Harry@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop02'
        },
        {
            id: '4f0b5003-c592-4469-bbe9-22180faffe7c',
            name: 'Lara',
            password: '123',
            avatar: '/static/images/Avatar-8.png',
            email: 'Lara@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop02'
        },
        {
            id: 'f51f6655-be49-4813-87ad-353b9eee971f',
            name: 'Leo',
            password: '123',
            avatar: '/static/images/Avatar-9.png',
            email: 'Leo@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop03'
        },
        {
            id: '6c751842-545d-4da0-a203-49c31a78d202',
            name: 'Belle',
            password: '123',
            avatar: '/static/images/Avatar-10.png',
            email: 'Belle@goeasy.io',
            phone: '138xxxxxxxx',
            shopId: 'shop03'
        }
    ];
    // 订单
    orders = [
        {
            id: '252364104325',
            url: '/static/images/goods1-1.jpg',
            name: '青桔柠檬气泡美式',
            price: '￥23',
            count: 1
        },
        {
            id: '251662058022',
            url: '/static/images/goods1-2.jpg',
            name: '咸柠七',
            price: '￥8',
            count: 2
        },
        {
            id: '250676186141',
            url: '/static/images/goods1-3.jpg',
            name: '黑糖波波鲜奶茶',
            price: '￥12',
            count: 1
        }
    ];

    findShops() {
        return this.shops;
    }

    findCustomerById(customerId) {
        return this.customers.find((customer) => customer.id === customerId);
    }

    findCustomer(username, password) {
        return this.customers.find((customer) => customer.name === username && customer.password === password);
    }

    findAgents() {
        this.agents.forEach((agent) => {
            agent.shop = this.findShopById(agent.shopId);
        })
        return this.agents;
    }

    findShopById(shopId) {
        return this.shops.find((shop) => shop.id === shopId);
    }

    findAgent(username, password) {
        return this.agents.find((agent) => agent.name === username && agent.password === password);
    }

    findAgentById(agentId) {
        return this.agents.find((agent) => agent.id === agentId);
    }

    getOrderList() {
        return this.orders;
    }

    findCustomers() {
        return this.customers;
    }

}

export default new RestApi();
