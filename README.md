# FrontOffice

==test list scenario==
1. checkin (nama, nomer hp, quantity pengunjung) | result OK
2. checkin (nama, nomer hp, quantity pengunjung, keterangan, desc) | result OK

3. checkin promo(nama, nomer hp, quantity pengunjung, keterangan, desc,promo room) | result OK
4. checkin promo(nama, nomer hp, quantity pengunjung, keterangan, desc,promo food) | result OK
5. checkin promo(nama, nomer hp, quantity pengunjung, keterangan, desc,promo room,promo food) | result OK

3. checkin uang_muka(nama, nomer hp, quantity pengunjung, keterangan, desc,cash) | result OK
4. checkin uang_muka(nama, nomer hp, quantity pengunjung, keterangan, desc,debet) | result OK
5. checkin uang_muka(nama, nomer hp, quantity pengunjung, keterangan, desc,credit) | result ok







Command to distribusi file exe 32 bit # npm run dist32
Command to distribusi file exe 32 bit # npm run dist64

npm run package-win-ihp

ROOM

1. Menampilkan Jenis Kamar
http://192.168.43.164:3000/room/jenis-kamar

2. Menampilkan all berdasar Jenis Kamar
http://192.168.43.164:3000/room/jenis-kamar/SMALL

3. Menampilkan All KamarReady 
untuk Point Of sales lama
http://192.168.43.164:3000/room/ready
untuk Point Of sales lama
http://192.168.43.164:3000/room/checkin

4. Menampilkan All Room
http://192.168.43.164:3000/room/all-room

4. Menampilkan All Room ready
http://192.168.43.164:3000/room/all-room-ready

4. Menampilkan All Room checkin
http://192.168.43.164:3000/room/all-room-checkin

1. Menampilkan Jenis Kamar ready
http://192.168.43.164:3000/room/jenis-kamar-ready/SMALL

5. Menampilkan Order Room
http://192.168.43.164:3000/room/202/order

6. Checkout Room
http://192.168.43.164:3000/room/checkout
(
@Field("room") String room
@Field("chusr") String user,
@Field("model_android") String android_model
);

7. Menampilkan Room No
http://192.168.43.164:3000/room/ReceptionRoomNo
(
@Field("room") String room
);

8. Menampilkan Room Reception by ipadrress
http://192.168.43.164:3000/room/Reception
(
@Field("ipAddress") String room
);

gambar Room
http://192.168.43.164:3000/room/image/201.jpg

Video Iklan Room
http://192.168.43.164:3000/room/video/advVideo.mp4

USER
2. cek user password
http://192.168.43.164:3000/user/login
(
@Field("User_Id") String User_Id,
@Field("User_Password") String User_Password
)

2. cek user password
http://192.168.43.164:3000/user/loginDekripsi
(
@Field("User_Id") String User_Id,
@Field("User_Password") String User_Password
)

INVENTORY Poin Of Of Sales Lama
inventory untuk server waiters
http://192.168.43.164:3000/inventory/list

inventory untuk server waiters
http://192.168.43.164:3000/inventory/list-front-office

gambar fnb
http://192.168.43.164:3000/inventory/image/MKHP-AY-001.jpg

Config
Profile Outlet
http://192.168.43.164:3000/config/profile
versi database
http://192.168.43.164:3000/config/version

Checksound
http://192.168.43.164:3000/checksound/checksound
(
@Field("user_name") String userName,
@Field("room") String room,
@Field("jumlah_checksound") int jumlahCheckSound
);

Opr dibersihkan setelah checkout
http://192.168.43.164:3000/checksound/opr-dibersihkan
(
@Field("room") String room
@Field("chusr") String user,
@Field("model_android") String android_model
);

Checkin
Checkin Via FO
http://192.168.43.164:3000/checkin/checkin
(
@Field("room") String room,
@Field("nama_tamu") String namaTamu,
@Field("member") String member,
@Field("durasi_jam") int durasiJam,
@Field("durasi_menit") int durasiMenit,
@Field("jumlah_tamu") int jumlahTamu,
@Field("qm1") int qm1,
@Field("qm2") int qm2,
@Field("qm3") int qm3,
@Field("qm4") int qm4,
@Field("qf1") int qf1,
@Field("qf2") int qf2,
@Field("qf3") int qf3,
@Field("qf4") int qf4
);

direct checkin
http://192.168.43.164:3000/checkin-direct/direct-checkin

Checkin Result
http://192.168.43.164:3000/checkin/checkin-result/204

Order
Pembatalan Order
http://192.168.43.164:3000/order/cancelOrder
(
@Field("order_slip_order") String slipOrder,
@Field("order_inventory") String inventory,
@Field("order_qty") int qty,
@Field("order_room_rcp") String rcp,
@Field("order_room_user") String user,
@Field("order_model_android") String android_model
);

untuk Point Of sales lama
submit Order
http://192.168.43.164:3000/single/room/sol/sod
(
@Field("order_user_name") String userName,
@Field("order_room_code") String roomCode,
@Field("order_room_rcp") String roomRcp,
@Field("order_room_type") String roomType,
@Field("order_room_durasi_checkin") int durasiCheckin,
@Field("order_pos_ip") String posIp,
@Field("order_model_android") String android_model,
@Field("arr_order_inv[]") List<String> listOrderInv,
@Field("arr_order_qty[]") List<Integer> listOrderQty,
@Field("arr_order_notes[]") List<String> listOrderNotes,
@Field("arr_order_price[]") List<Double> listPriceInv,
@Field("arr_order_nama_item[]") List<String> listNamaItem,
@Field("arr_order_location_item[]") List<Integer> ListLocationItem
);

promo room
http://192.168.43.164:3000/promo/promo-room/SMALL
promo food
http://192.168.43.164:3000/promo/promo-food/SMALL/206

voucher membership
http://13.76.167.131:4012/vcr/getVocherDetail/HP059/VV-123456789123456

Voucher FO
http://192.168.43.164:3000/voucher/get-voucher/V059-2009040001

voucher web membership
http://192.168.43.164:3000/voucher/get-voucher-web-membership/HP059/VV-123456789123456

generate id non member
http://192.168.43.164:3000/member/generate-id-non-member/A,I.NULRosidi

Cek Member webmemership 
http://13.76.167.131:4012/mbr/detail/10001609031212
http://192.168.43.164:3000/member/membership/10001609031212


//Dilah
1. Pembayaran
-------------
1a. Proses bayar
URL/payment/add : POST
{
   "chusr":"AIN",
   "room":"203",
   "order_room_payment":[
      {
         "nominal":50000.0,
         "payment_type":"CASH"
      },
      {
         "approval_code_credit":"x85996",
         "card_code_credit":"097586",
         "card_credit":"BCA",
         "edc_credit":"BCA",
         "expired_date_credit":"31-10-2020",
         "nama_user_credit":"Ganda",
         "nominal":500000.0,
         "payment_type":"CREDIT CARD"
      }
   ]
}

2. Cancel
---------
2a. Proses cancel
URL/cancelorder/add : POST
{
   "chusr":"AIN",
   "room":"203",
   "order_inventory":[
      {
        "inventory": "PERM04",
        "nama": "PERM04",
        "qty": 1,
        "order_penjualan": "OKL-2010240005",
        "slip_order": "SOL-20102400061"
      }
   ]
}

3. Order
--------
3a. Proses mendapatkan data order berdasarkan room
URL/neworder/get/:room : GET
--------
3b. Proses DO dari FO
URL/neworder/add : POST
{
   "chusr":"AIN",
   "room":"203",
   "room_order":[
      {
        "Inventory": "PERM04",
        "Name": "SILVERQUEEN",
        "Qty": 2,
        "SlipOrder": "SOL-20102800031"
      },
      {
        "Inventory": "RKOK07",
        "Name": "MARLBORO BLACK MENTHOL",
        "Qty": 3,
        "SlipOrder": "SOL-20102800031"
      },
      {
        "Inventory": "RKOK01",
        "Name": "AVOLUTION MERAH",
        "Qty": 3,
        "SlipOrder": "SOL-20102800041"
      },
      {
        "Inventory": "PROM01",
        "Name": "ASBAK CRYSTAL",
        "Qty": 4,
        "SlipOrder": "SOL-20102800051"
      }
   ]
}


4. SlipOrder
------------
4a. Proses mendapatkan data sliporder berdasarkan room
URL/order/getfo/:room : GET
