var OrderInventoryModel = require('../model/order.inventory.model');
var OrderRoomModel = require('../model/order.room.model');

class OrderInventoryService {

    constructor(logger) {
        this.log = logger;
    }

    async getAllOrderState(room) {
        const promises = [
            this.getOrderPenjualan(room.room_ivc),
            this.getOrderCancelation(room.room_ivc),
            this.getSlipOrderStatus(room.room_ivc),
        ];
        return Promise.all(promises)
            .then(data => {
                room.order_inventory = data[0];
                room.order_inventory_cancelation = data[1];
                room.order_inventory_progress = data[2];
                room.summary_order_inventory = this.getSummaryOrderInventory(
                    this.getSummaryProgressOrderInventory(room.order_inventory),
                    this.getSummaryCancelOrderInventory(room.order_inventory_cancelation)
                );
                return room;
            })
            .catch((err) => {
                return err.message;
            });
    }

    async getOrderPenjualan(ivc) {
        let orderInventoryModel = new OrderInventoryModel(this.log);
        return orderInventoryModel.getOrderPenjualanDb(ivc);
    }

    async getOrderCancelation(ivc) {
        let orderInventoryModel = new OrderInventoryModel(this.log);
        return orderInventoryModel.getOrderCancelationDb(ivc);
    }

    async getSlipOrderStatus(ivc) {
        let orderInventoryModel = new OrderInventoryModel(this.log);
        return orderInventoryModel.getSlipOrderStatusDb(ivc);
    }

    /**
    * method ini untuk mendapatkan data order tiap rcp 
    */
    async getOrderPenjualanByRcp(rcp) {
        let orderInventoryModel = new OrderInventoryModel(this.log);
        return orderInventoryModel.getOrderPenjualanByRcpDb(rcp);
    }

    /**
    * method ini untuk mendapatkan data CANCEL order tiap rcp
    */
    async getCancelOrderPenjualanByRcp(rcp) {
        let orderInventoryModel = new OrderInventoryModel(this.log);
        return orderInventoryModel.getCancelOrderPenjualanByRcpDb(rcp);
    }

    /**
    * method ini untuk distinct list data object order(sudah DO),
    * jika ada dua tipe item yang sama,
    * kedua item tersebut digabung dan propety item dijumlahkan/merge
    */
    getSummaryProgressOrderInventory(eOrderPenjualan) {

        let distinctData = [...new Set(eOrderPenjualan.map(data => data.inventory))];


        let summary = [];
        distinctData.forEach((inventory_code) => {
            let totalQty, totalPayment, totalDiskon;
            let filterData = eOrderPenjualan.filter(data => data.inventory == inventory_code);

            totalQty = filterData.reduce((n, { qty }) => n + qty, 0);
            totalPayment = filterData.reduce((a, { total_setelah_diskon }) => a + total_setelah_diskon, 0);
            totalDiskon = filterData.reduce((a, { total_diskon }) => a + total_diskon, 0);

            summary.push({
                "inventory": inventory_code,
                "nama": filterData[0].nama,
                "price": filterData[0].price,
                "total_diskon": totalDiskon,
                "total_setelah_diskon": totalPayment,
                "qty": totalQty
            });
        });

        return summary;
    }

    /**
    * method ini untuk distinct list data object order yang dicancel,
    * jika ada dua tipe item yang sama,
    * kedua item tersebut digabung  dan propety item dijumlahkan/merge
    */
    getSummaryCancelOrderInventory(eOrderCancelation) {
        let distinctData = [...new Set(eOrderCancelation.map(data => data.inventory))];


        let summary = [];
        distinctData.forEach((inventory_code) => {
            let totalQty, totalPayment, totalDiskon;
            let filterData = eOrderCancelation.filter(data => data.inventory == inventory_code);

            totalQty = filterData.reduce((n, { qty }) => n + qty, 0);
            totalPayment = filterData.reduce((a, { total_setelah_diskon }) => a + total_setelah_diskon, 0);
            totalDiskon = filterData.reduce((a, { total_diskon }) => a + total_diskon, 0);

            summary.push({
                "inventory": inventory_code,
                "nama": filterData[0].nama,
                "price": filterData[0].price,
                "total_diskon": totalDiskon,
                "total_setelah_diskon": totalPayment,
                "qty": totalQty
            });
        });

        return summary;
    }

    /**
    * menghitung hasil getSummaryProgressOrderInventory() dan getSummaryCancelOrderInventory,
    * menghasilkan list data order final yang tidak atau belum tercancel
    */
    getSummaryOrderInventory(summaryProgress, summaryCancel) {
        let summary = [];
        summaryProgress.forEach(fnbProgres => {
            let filterDataCancel = summaryCancel.filter(data => data.inventory == fnbProgres.inventory);
            if (filterDataCancel.length > 0) {
                if ((fnbProgres.qty - filterDataCancel[0].qty) > 0) {
                    summary.push({
                        "inventory": fnbProgres.inventory,
                        "nama": fnbProgres.nama,
                        "price": fnbProgres.price,
                        "total_diskon": (fnbProgres.total_diskon - filterDataCancel[0].total_diskon),
                        "total_setelah_diskon": (fnbProgres.total_setelah_diskon - filterDataCancel[0].total_setelah_diskon),
                        "qty": (fnbProgres.qty - filterDataCancel[0].qty)
                    });
                }
            } else {
                summary.push({
                    "inventory": fnbProgres.inventory,
                    "nama": fnbProgres.nama,
                    "price": fnbProgres.price,
                    "total_diskon": fnbProgres.total_diskon,
                    "total_setelah_diskon": fnbProgres.total_setelah_diskon,
                    "qty": fnbProgres.qty
                });
            }

        });

        return summary;
    }

    async getUnprocessedOrderInventory(room_code, callback) {
        let orderRoomModel = new OrderRoomModel(this.log);
        let rcp = await orderRoomModel.getReceptionCodeByCodeRoom(room_code);

        if (rcp) {
            let orderInventoryModel = new OrderInventoryModel(this.log);
            let isAvailableOrderUnprocced = await orderInventoryModel.isAvailableUnprocessedOrder(rcp);
            if (isAvailableOrderUnprocced) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }

    }
}

module.exports = OrderInventoryService;