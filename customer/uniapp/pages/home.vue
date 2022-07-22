<template>
	<view class="home-main">
		<view class="shop-list">
			<view class="shop-item" v-for="shop in shopList" :key="shop.id">
				<view class="item-head">
					<view class="shop-info">
						<image :src="shop.avatar"></image>
						<view>{{shop.name}}</view>
					</view>
					<view class="consult-buton" @click="consult(shop.id)">咨询</view>
				</view>
				<view class="item-body">
					<image v-for="good in shop.goods" :src="good"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import restApi from '../lib/restapi.js'
	export default {
		data() {
			return {
				shopList: restApi.getShopList()
			}
		},
		methods: {
			consult (id) {
				//todo:这种路径看起来很迂腐，不是吗？
				uni.navigateTo({url: './chat?to='+id});
			}
		}
	}
</script>

<style>
.shop-list {
	display: flex;
	flex-direction: column;
}
.shop-item {
	display: flex;
	flex-direction: column;
}
.item-head {
	display: flex;
	justify-content: space-between;
	padding: 0 20rpx;
	margin: 10rpx 0;
	align-items: center;
}
.item-head image {
	border-radius: 50%;
	width: 90rpx;
	height: 90rpx;
	margin-right: 20rpx;
}
.shop-info {
	display: flex;
	align-items: center;
	flex: 1;
}
.consult-buton {
	width: 100rpx;
	height: 50rpx;
	border-radius: 20px;
	background: #d02129;
	color: #ffffff;
	text-align: center;
	font-size: 28rpx;
	line-height: 50rpx;
}
.item-body {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
}
.item-body image {
	width: 200rpx;
	height: 200rpx;
}

</style>
