var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var dataResponse;

class PromoFood {
   constructor() { }

   getPromoFoodByRcpCheckin(db_, promo_, durasi_menit_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var room = room_;
            var kode_rcp = kode_rcp_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
          select
   IHP_PromoFood.[Promo_Food] as promo_food,
   IHP_PromoFood.[Syarat_Kamar] as syarat_kamar,
   IHP_PromoFood.[Kamar] as kamar,
   IHP_PromoFood.[Syarat_Jenis_kamar] as syarat_jenis_kamar,
   IHP_PromoFood.[Jenis_Kamar] as jenis_kamar,
   IHP_PromoFood.[Syarat_Durasi] as syarat_durasi,
   IHP_PromoFood.[Durasi] as durasi,
   IHP_PromoFood.[Syarat_Hari] as syarat_hari,
   IHP_PromoFood.[Hari] as hari,
   IHP_PromoFood.[Syarat_Jam] as syarat_jam,
   IHP_PromoFood.[Date_Start] as date_start,
   IHP_PromoFood.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
   end
   as date_time_start, IHP_PromoFood.[Date_Finish] as date_finish, IHP_PromoFood.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Rcp.Checkout BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
         end
      then
         '1' 
      else
         '0' 
   end
   as status_jam_sekarang_masuk_masa_promo , DATEDIFF(mi, IHP_Rcp.Checkout, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
) AS sisa_waktu_promo_hari_ini_menit , IHP_PromoFood.[Syarat_Inventory] as syarat_inventory, IHP_PromoFood.[Inventory] as inventory, IHP_PromoFood.[Syarat_Quantity] as syarat_quantity, IHP_PromoFood.[Quantity] as quantity, IHP_PromoFood.[Sign_Inventory] as sign_inventory, IHP_PromoFood.[Sign_Diskon_Persen] as sign_diskon_persen, IHP_PromoFood.[Diskon_Persen] as diskon_persen, IHP_PromoFood.[Sign_Diskon_Rp] sign_diskon_rp, IHP_PromoFood.[Diskon_Rp] diskon_rp, IHP_PromoFood.[Khusus] as khusus , 
   case
      when
         IHP_PromoFood.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoFood.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as Khusus1, IHP_PromoFood.[Status] as status_aktif, IHP_PromoFood.[Global] as global , 
   case
      when
         IHP_PromoFood.[Global] = 0 
      then
         'PROMO FNB PER ITEM' 
      when
         IHP_PromoFood.[Global] = 1 
      then
         'PROMO UNTUK SEMUA FNB' 
   end
   as keterangan_global, IHP_Rcp.Checkout as checkin, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) as checkout, 
   case
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkin_in_range_start_promo_and_end_promo, 
   case
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkout_in_range_start_promo_and_end_promo, 
   case
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         2 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         3 
      else
         0 
   end
   as awal_tengah_akhir, DATEDIFF(mi, IHP_Rcp.Checkout , 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
      end
   )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) as different_time_Start_and_checkout, 
   case
      when
         (
            IHP_Rcp.Checkin between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Rcp.Checkin , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
      when
         (
            IHP_Rcp.Checkin between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Rcp.Checkin , 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
) 
         when
            (
               DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                     else
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  end
               )
            )
         then
            DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
            else
               0 
   end
   as menit_yang_digunakan, 
   case
      when
         (
            IHP_Rcp.Checkin between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkin , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
         )
, IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkin , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
         )
, IHP_Rcp.Checkin), 114), 1, 8) 
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkin , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkin , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkin), 114), 1, 8) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 8) 
   end
   as hasil_end_promo, 
   case
      when
         (
            IHP_Rcp.Checkin between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkin), 114), 1, 8) 
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkin), 114), 1, 8) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 8) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoFood , IHP_Rcp 
where
   (
      IHP_PromoFood.Kamar = '[NONE]' 
      or IHP_PromoFood.Kamar = '${room}' 
   )
   and 
   (
      IHP_PromoFood.Hari = 0 
      or IHP_PromoFood.Hari = 5 
   )
   and 
   (
      IHP_PromoFood.Jenis_Kamar = '[NONE]' 
      or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}' 
   )
   and IHP_PromoFood.Status = 1 
   and [IHP_PromoFood].[Promo_Food]='${promo}'
   and IHP_Rcp.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     dataResponse = new ResponseFormat(true, dataReturn.recordset);
                     if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                        console.log("promo food " + promo_ + " " +
                           dataReturn.recordset[0].hasil_start_promo + " " +
                           dataReturn.recordset[0].hasil_end_promo);

                        logger.info("promo food " + promo_ + " " +
                           dataReturn.recordset[0].hasil_start_promo + " " +
                           dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log("promo food " + promo_ + " Promo Food tidak Berlaku");
                        logger.info("promo food " + promo_ + " Promo Food tidak Berlaku");
                     }
                     resolve(dataResponse);
                  }
                  else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getPromoFoodExtendByJamCheckoutIhpRoom(db_, promo_, durasi_menit_, kode_rcp_, jenis_kamar_, room_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
          select
   IHP_PromoFood.[Promo_Food] as promo_food,
   IHP_PromoFood.[Syarat_Kamar] as syarat_kamar,
   IHP_PromoFood.[Kamar] as kamar,
   IHP_PromoFood.[Syarat_Jenis_kamar] as syarat_jenis_kamar,
   IHP_PromoFood.[Jenis_Kamar] as jenis_kamar,
   IHP_PromoFood.[Syarat_Durasi] as syarat_durasi,
   IHP_PromoFood.[Durasi] as durasi,
   IHP_PromoFood.[Syarat_Hari] as syarat_hari,
   IHP_PromoFood.[Hari] as hari,
   IHP_PromoFood.[Syarat_Jam] as syarat_jam,
   IHP_PromoFood.[Date_Start] as date_start,
   IHP_PromoFood.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
   end
   as date_time_start, IHP_PromoFood.[Date_Finish] as date_finish, IHP_PromoFood.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Room.Jam_Checkout BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
         end
      then
         '1' 
      else
         '0' 
   end
   as status_jam_sekarang_masuk_masa_promo , DATEDIFF(mi, IHP_Room.Jam_Checkout, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
) AS sisa_waktu_promo_hari_ini_menit , IHP_PromoFood.[Syarat_Inventory] as syarat_inventory, IHP_PromoFood.[Inventory] as inventory, IHP_PromoFood.[Syarat_Quantity] as syarat_quantity, IHP_PromoFood.[Quantity] as quantity, IHP_PromoFood.[Sign_Inventory] as sign_inventory, IHP_PromoFood.[Sign_Diskon_Persen] as sign_diskon_persen, IHP_PromoFood.[Diskon_Persen] as diskon_persen, IHP_PromoFood.[Sign_Diskon_Rp] sign_diskon_rp, IHP_PromoFood.[Diskon_Rp] diskon_rp, IHP_PromoFood.[Khusus] as khusus , 
   case
      when
         IHP_PromoFood.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoFood.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as Khusus1, IHP_PromoFood.[Status] as status_aktif, IHP_PromoFood.[Global] as global , 
   case
      when
         IHP_PromoFood.[Global] = 0 
      then
         'PROMO FNB PER ITEM' 
      when
         IHP_PromoFood.[Global] = 1 
      then
         'PROMO UNTUK SEMUA FNB' 
   end
   as keterangan_global, IHP_Room.Jam_Checkout as checkin, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) as checkout, 
   case
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkin_in_range_start_promo_and_end_promo, 
   case
      when
         DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkout_in_range_start_promo_and_end_promo, 
   case
      when
         (
            IHP_Room.Jam_Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         2 
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         3 
      else
         0 
   end
   as awal_tengah_akhir, DATEDIFF(mi, IHP_Room.Jam_Checkout , 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
      end
   )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) as different_time_Start_and_checkout, 
   case
      when
         (
            IHP_Room.Jam_Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Room.Jam_Checkout , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
      when
         (
            IHP_Room.Jam_Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Room.Jam_Checkout , 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
) 
         when
            (
               DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                     else
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  end
               )
            )
         then
            DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
            else
               0 
   end
   as menit_yang_digunakan, 
   case
      when
         (
            IHP_Room.Jam_Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Room.Jam_Checkout , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
         )
, IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Room.Jam_Checkout , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
         )
, IHP_Room.Jam_Checkout), 114), 1, 8) 
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Room.Jam_Checkout , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Room.Jam_Checkout , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Room.Jam_Checkout), 114), 1, 8) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 8) 
   end
   as hasil_end_promo, 
   case
      when
         (
            IHP_Room.Jam_Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Room.Jam_Checkout), 114), 1, 8) 
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Room.Jam_Checkout), 114), 1, 8) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 8) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoFood , IHP_Room 
where
   (
      IHP_PromoFood.Kamar = '[NONE]' 
      or IHP_PromoFood.Kamar = '${room}' 
   )
   and 
   (
      Hari = 0 
      or Hari = 5 
   )
   and 
   (
      IHP_PromoFood.Jenis_Kamar = '[NONE]' 
      or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}' 
   )
   and Status = 1 
   and Promo_Food = '${promo}' 
   and IHP_Room.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     dataResponse = new ResponseFormat(true, dataReturn.recordset);
                     if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                        console.log(kode_rcp + " promo " + promo_ +
                           " start promo food " + dataReturn.recordset[0].hasil_start_promo +
                           " finish promo food " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info(kode_rcp + " promo " + promo_ +
                           " start promo food " + dataReturn.recordset[0].hasil_start_promo +
                           " finish promo food " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log(kode_rcp + " promo " + promo_ + " Promo Food tidak Berlaku");
                        logger.info(kode_rcp + " promo " + promo_ + " Promo Food tidak Berlaku");
                     }
                     resolve(dataResponse);
                  }
                  else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getPromoFoodExtendRoomOldTranferByRcpCheckOut(db_, promo_, durasi_menit_, kode_rcp_, jenis_kamar_, room_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var room = room_;
            var kode_rcp = kode_rcp_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
          select
   IHP_PromoFood.[Promo_Food] as promo_food,
   IHP_PromoFood.[Syarat_Kamar] as syarat_kamar,
   IHP_PromoFood.[Kamar] as kamar,
   IHP_PromoFood.[Syarat_Jenis_kamar] as syarat_jenis_kamar,
   IHP_PromoFood.[Jenis_Kamar] as jenis_kamar,
   IHP_PromoFood.[Syarat_Durasi] as syarat_durasi,
   IHP_PromoFood.[Durasi] as durasi,
   IHP_PromoFood.[Syarat_Hari] as syarat_hari,
   IHP_PromoFood.[Hari] as hari,
   IHP_PromoFood.[Syarat_Jam] as syarat_jam,
   IHP_PromoFood.[Date_Start] as date_start,
   IHP_PromoFood.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
   end
   as date_time_start, IHP_PromoFood.[Date_Finish] as date_finish, IHP_PromoFood.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Rcp.Checkout BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
         end
      then
         '1' 
      else
         '0' 
   end
   as status_jam_sekarang_masuk_masa_promo , DATEDIFF(mi, IHP_Rcp.Checkout, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
   end
) AS sisa_waktu_promo_hari_ini_menit , IHP_PromoFood.[Syarat_Inventory] as syarat_inventory, IHP_PromoFood.[Inventory] as inventory, IHP_PromoFood.[Syarat_Quantity] as syarat_quantity, IHP_PromoFood.[Quantity] as quantity, IHP_PromoFood.[Sign_Inventory] as sign_inventory, IHP_PromoFood.[Sign_Diskon_Persen] as sign_diskon_persen, IHP_PromoFood.[Diskon_Persen] as diskon_persen, IHP_PromoFood.[Sign_Diskon_Rp] sign_diskon_rp, IHP_PromoFood.[Diskon_Rp] diskon_rp, IHP_PromoFood.[Khusus] as khusus , 
   case
      when
         IHP_PromoFood.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoFood.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as Khusus1, IHP_PromoFood.[Status] as status_aktif, IHP_PromoFood.[Global] as global , 
   case
      when
         IHP_PromoFood.[Global] = 0 
      then
         'PROMO FNB PER ITEM' 
      when
         IHP_PromoFood.[Global] = 1 
      then
         'PROMO UNTUK SEMUA FNB' 
   end
   as keterangan_global, IHP_Rcp.Checkout as checkin, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) as checkout, 
   case
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkin_in_range_start_promo_and_end_promo, 
   case
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      else
         0 
   end
   as checkout_in_range_start_promo_and_end_promo, 
   case
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         2 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         1 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         3 
      else
         0 
   end
   as awal_tengah_akhir, DATEDIFF(mi, IHP_Rcp.Checkout , 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         else
            DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
      end
   )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) as different_time_Start_and_checkout, 
   case
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Rcp.Checkout , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Rcp.Checkout , 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
) 
         when
            (
               DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                     else
                        DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  end
               )
            )
         then
            DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
            else
               0 
   end
   as menit_yang_digunakan, 
   case
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkout , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
         )
, IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkout , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
         )
, IHP_Rcp.Checkout), 114), 1, 8) 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkout , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Rcp.Checkout , 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkout), 114), 1, 8) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 8) 
   end
   as hasil_end_promo, 
   case
      when
         (
            IHP_Rcp.Checkout between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkout), 114), 1, 8) 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            0 
         )
, IHP_Rcp.Checkout), 114), 1, 8) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
            else
               DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
               else
                  DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
            end
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                  else
                     DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 8) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoFood , IHP_Rcp 
where
   (
      IHP_PromoFood.Kamar = '[NONE]' 
      or IHP_PromoFood.Kamar = '${room}' 
   )
   and 
   (
      IHP_PromoFood.Hari = 0 
      or IHP_PromoFood.Hari = 5 
   )
   and 
   (
      IHP_PromoFood.Jenis_Kamar = '[NONE]' 
      or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}' 
   )
   and IHP_PromoFood.Status = 1 
   and [IHP_PromoFood].[Promo_Food]='${promo}'
   and IHP_Rcp.Reception = '${kode_rcp}'`;


            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     dataResponse = new ResponseFormat(true, dataReturn.recordset);
                     if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                        console.log("promo food " + promo_ + " " +
                           dataReturn.recordset[0].hasil_start_promo + " " +
                           dataReturn.recordset[0].hasil_end_promo);

                        logger.info("promo food " + promo_ + " " +
                           dataReturn.recordset[0].hasil_start_promo + " " +
                           dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log("promo food " + promo_ + " Promo Food tidak Berlaku");
                        logger.info("promo food " + promo_ + " Promo Food tidak Berlaku");
                     }
                     resolve(dataResponse);
                  }
                  else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getPromoFoodMultipleExtendByJamStartExtend(db_, promo_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var jenis_kamar = jenis_kamar_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               select
               IHP_PromoFood.[Promo_Food] as promo_food,
               IHP_PromoFood.[Syarat_Kamar] as syarat_kamar,
               IHP_PromoFood.[Kamar] as kamar,
               IHP_PromoFood.[Syarat_Jenis_kamar] as syarat_jenis_kamar,
               IHP_PromoFood.[Jenis_Kamar] as jenis_kamar,
               IHP_PromoFood.[Syarat_Durasi] as syarat_durasi,
               IHP_PromoFood.[Durasi] as durasi,
               IHP_PromoFood.[Syarat_Hari] as syarat_hari,
               IHP_PromoFood.[Hari] as hari,
               IHP_PromoFood.[Syarat_Jam] as syarat_jam,
               IHP_PromoFood.[Date_Start] as date_start,
               IHP_PromoFood.[Time_Start] as time_start,
               case
                 when
                   CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                   and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                 then
                   DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
                 else
                   DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
               end
               as date_time_start, IHP_PromoFood.[Date_Finish] as date_finish, IHP_PromoFood.[Time_Finish] as time_finish, 
               case
                 when
                   CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                   and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                 then
                   DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
                 else
                   DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
               end
               as date_time_finish , 
               case
                 when
                   IHP_Ext.Start_Extend BETWEEN 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoFood.[Time_Start])) 
                     else
                       DATEADD(day, IHP_PromoFood.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoFood.[Time_Start])) 
                   end
                   and 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                       and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
                     else
                       DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
                   end
                 then
                   '1' 
                 else
                   '0' 
               end
               as status_jam_sekarang_masuk_masa_promo , DATEDIFF(mi, IHP_Ext.Start_Extend, 
               case
                 when
                   CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                   and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                 then
                   DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
                 else
                   DATEADD(day, IHP_PromoFood.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoFood.[Time_Finish])) 
               end
             ) AS sisa_waktu_promo_hari_ini_menit , IHP_PromoFood.[Syarat_Inventory] as syarat_inventory, IHP_PromoFood.[Inventory] as inventory, IHP_PromoFood.[Syarat_Quantity] as syarat_quantity, IHP_PromoFood.[Quantity] as quantity, IHP_PromoFood.[Sign_Inventory] as sign_inventory, IHP_PromoFood.[Sign_Diskon_Persen] as sign_diskon_persen, IHP_PromoFood.[Diskon_Persen] as diskon_persen, IHP_PromoFood.[Sign_Diskon_Rp] sign_diskon_rp, IHP_PromoFood.[Diskon_Rp] diskon_rp, IHP_PromoFood.[Khusus] as khusus , 
               case
                 when
                   IHP_PromoFood.[Khusus] = 0 
                 then
                   'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
                 when
                   IHP_PromoFood.[Khusus] = 1 
                 then
                   'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
               end
               as Khusus1, IHP_PromoFood.[Status] as status_aktif, IHP_PromoFood.[Global] as global , 
               case
                 when
                   IHP_PromoFood.[Global] = 0 
                 then
                   'PROMO FNB PER ITEM' 
                 when
                   IHP_PromoFood.[Global] = 1 
                 then
                   'PROMO UNTUK SEMUA FNB' 
               end
               as keterangan_global,
               IHP_Ext.Start_Extend as checkin, DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) as checkout, 
               case
                 when
                   IHP_Ext.Start_Extend between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   1 
                 else
                   0 
               end
               as checkin_in_range_start_promo_and_end_promo,
               case
                 when
                   DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   1 
                 else
                   0 
               end
               as checkout_in_range_start_promo_and_end_promo, 
               case
                 when
                   (
                     IHP_Ext.Start_Extend between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                   and 
                   (
                     DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                 then
                   2 
                 when
                   IHP_Ext.Start_Extend between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   1 
                 when
                   DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   3 
                 else
                   0 
               end
               as awal_tengah_akhir, DATEDIFF(mi, IHP_Ext.Start_Extend , 
               (
                 case
                   when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                   then
                     DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                   else
                     DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                 end
               )
             ) as different_checkin_and_finish_promo, DATEDIFF(mi, 
               (
                 case
                   when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                   then
                     DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   else
                     DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                 end
               )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) as different_time_Start_and_checkout, 
               case
                 when
                   (
                     IHP_Ext.Start_Extend between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                   and 
                   (
                     DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                 then
                   DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                 when
                   (
                     IHP_Ext.Start_Extend between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                 then
                   DATEDIFF(mi, IHP_Ext.Start_Extend , 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
             ) 
                   when
                     (
                       DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       end
             ) 
                       and 
                       (
                         case
                           when
                             CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                             and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                           then
                             DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                           else
                             DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         end
                       )
                     )
                   then
                     DATEDIFF(mi, 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       end
                     )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                     else
                       0 
               end
               as menit_yang_digunakan, 
               case
                 when
                   (
                     IHP_Ext.Start_Extend between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                   and 
                   (
                     DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                 then
                   CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                   )
             , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                   )
             , IHP_Ext.Start_Extend), 114), 1, 8) 
                 when
                   IHP_Ext.Start_Extend between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     DATEDIFF(mi, IHP_Ext.Start_Extend , 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
             ) 
                   )
             , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     DATEDIFF(mi, IHP_Ext.Start_Extend , 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
             ) 
                   )
             , IHP_Ext.Start_Extend), 114), 1, 8) 
                   when
                     DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                       0 
                     )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                       0 
                     )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 114), 1, 8) 
               end
               as hasil_end_promo, 
               case
                 when
                   (
                     IHP_Ext.Start_Extend between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                   and 
                   (
                     DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     end
             ) 
                     and 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       end
                     )
                   )
                 then
                   CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     0 
                   )
             , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     0 
                   )
             , IHP_Ext.Start_Extend), 114), 1, 8) 
                 when
                   IHP_Ext.Start_Extend between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     0 
                   )
             , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     0 
                   )
             , IHP_Ext.Start_Extend), 114), 1, 8) 
                 when
                   DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
                   case
                     when
                       CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                     else
                       DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                   end
             ) 
                   and 
                   (
                     case
                       when
                         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                       then
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                       else
                         DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                     end
                   )
                 then
                   CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     - DATEDIFF(mi, 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       end
                     )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                   )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                   (
                     - DATEDIFF(mi, 
                     (
                       case
                         when
                           CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                           and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                         then
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                         else
                           DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                       end
                     )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
                   )
             , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 114), 1, 8) 
               end
               as hasil_start_promo 
             FROM
               IHP_PromoFood 
               ,IHP_Ext 
             where
               (
                 IHP_PromoFood.Kamar = '[NONE]' 
                 or IHP_PromoFood.Kamar = '${room}'
               )
               and 
               (
                 Hari = 0 
                 or Hari = 5
               )
               and 
               (
                 IHP_PromoFood.Jenis_Kamar = '[NONE]' 
                 or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}'
               )
               and [IHP_PromoFood].[Status] = 1
               and IHP_PromoFood.Promo_Food='${promo}' 
               and IHP_Ext.Reception='${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     dataResponse = new ResponseFormat(true, dataReturn.recordset);
                     if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                        console.log(kode_rcp + " promo " + promo_ +
                           " start promo food " + dataReturn.recordset[0].hasil_start_promo +
                           " finish promo food " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info(kode_rcp + " promo " + promo_ +
                           " start promo food " + dataReturn.recordset[0].hasil_start_promo +
                           " finish promo food " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log(kode_rcp + " promo " + promo_ + " Promo Food tidak Berlaku");
                        logger.info(kode_rcp + " promo " + promo_ + " Promo Food tidak Berlaku");
                     }
                     resolve(dataResponse);
                  }
                  else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getDeleteInsertIhpPromoRcpFoodByRcpChekin(db_, promo_, durasi_menit_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `delete
            from
               [IHP_Promo_Rcp] 
            where
               Reception = '${kode_rcp}' 
               and [FlagExtend] = 0 
               and [Status_Promo] = 2 
               insert into
                  [IHP_Promo_Rcp] 
                  select
                     '${kode_rcp}' as Reception,
                     IHP_PromoFood.[Promo_Food] as Promo,
                     CONVERT(DATETIME, 
                     case
                        when
                           (
                              IHP_Rcp.Checkin between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                           and 
                           (
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkin), 114), 1, 8) 
                        when
                           IHP_Rcp.Checkin between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkin), 114), 1, 8) 
                        when
                           DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 end
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
                           )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 end
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
                           )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 8) 
                     end
            , 103) as Start_Promo, CONVERT(DATETIME, 
                     case
                        when
                           (
                              IHP_Rcp.Checkin between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                           and 
                           (
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkin , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
                           )
            , IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkin , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
                           )
            , IHP_Rcp.Checkin), 114), 1, 8) 
                        when
                           IHP_Rcp.Checkin between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkin , 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
            ) 
                           )
            , IHP_Rcp.Checkin), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkin , 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
            ) 
                           )
            , IHP_Rcp.Checkin), 114), 1, 8) 
                           when
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 0 
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 0 
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 8) 
                     end
            , 103) as End_Promo, 2 as Status_Promo, IHP_PromoFood.[Syarat_Kamar] as Syarat_Kamar, IHP_PromoFood.[Kamar] as Kamar, IHP_PromoFood.Syarat_Jenis_kamar as Syarat_Jenis_kamar, IHP_PromoFood.Jenis_Kamar as Jenis_Kamar, IHP_PromoFood.Syarat_Durasi as Syarat_Durasi, IHP_PromoFood.Durasi as Durasi, IHP_PromoFood.Syarat_Hari as Syarat_Hari, IHP_PromoFood.[Hari] as hari, IHP_PromoFood.Syarat_Jam as Syarat_Jam, IHP_PromoFood.[Date_Start] as Date_Start, IHP_PromoFood.[Time_Start] as Time_Start, IHP_PromoFood.[Date_Finish] as Date_Finish, IHP_PromoFood.[Time_Finish] as Time_Finish, IHP_PromoFood.[Syarat_Quantity] as Syarat_Quantity, IHP_PromoFood.Quantity as Quantity, IHP_PromoFood.[Diskon_Persen] as Diskon_Persen, IHP_PromoFood.[Diskon_Rp] as Diskon_Rp, IHP_PromoFood.[Syarat_Inventory] as Syarat_Inventory, IHP_PromoFood.[Inventory] as Inventory, IHP_PromoFood.[Sign_Inventory] as Sign_Inventory, IHP_PromoFood.[Sign_Diskon_Persen] as Sign_Diskon_Persen, IHP_PromoFood.[Sign_Diskon_Rp] as Sign_Diskon_Rp, 0 as FlagExtend 
                  FROM
                     IHP_PromoFood , IHP_Rcp 
                  where
                     (
                        IHP_PromoFood.Kamar = '[NONE]' 
                        or IHP_PromoFood.Kamar = '${room}' 
                     )
                     and 
                     (
                        IHP_PromoFood.Hari = 0 
                        or IHP_PromoFood.Hari = 5 
                     )
                     and 
                     (
                        IHP_PromoFood.Jenis_Kamar = '[NONE]' 
                        or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}' 
                     )
                     and IHP_PromoFood.Status = 1 
                     and [IHP_PromoFood].[Promo_Food] = '${promo}' 
                     and IHP_Rcp.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpFoodByRcpChekin ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses prosesQuery getDeleteInsertIhpPromoRcpFoodByRcpChekin ');
                  resolve(true);
               }
            });

         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getDeleteInsertIhpPromoRcpFoodExtendRoomOldTranferByRcpCheckOut(db_, promo_, durasi_menit_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               insert into
                  [IHP_Promo_Rcp] 
                  select
                     '${kode_rcp}' as Reception,
                     IHP_PromoFood.[Promo_Food] as Promo,
                     CONVERT(DATETIME, 
                     case
                        when
                           (
                              IHP_Rcp.Checkout between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                           and 
                           (
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkout), 114), 1, 8) 
                        when
                           IHP_Rcp.Checkout between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
            , IHP_Rcp.Checkout), 114), 1, 8) 
                        when
                           DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 end
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
                           )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 end
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
                           )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 8) 
                     end
            , 103) as Start_Promo, CONVERT(DATETIME, 
                     case
                        when
                           (
                              IHP_Rcp.Checkout between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                           and 
                           (
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkout , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
                           )
            , IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkout , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
                           )
            , IHP_Rcp.Checkout), 114), 1, 8) 
                        when
                           IHP_Rcp.Checkout between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              else
                                 DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkout , 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
            ) 
                           )
            , IHP_Rcp.Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, IHP_Rcp.Checkout , 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
            ) 
                           )
            , IHP_Rcp.Checkout), 114), 1, 8) 
                           when
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                                 else
                                    DATEADD(day, [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                    else
                                       DATEADD(day, [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + [IHP_PromoFood].[Time_Finish])) 
                                 end
                              )
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 0 
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 0 
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 8) 
                     end
            , 103) as End_Promo, 2 as Status_Promo, IHP_PromoFood.[Syarat_Kamar] as Syarat_Kamar, IHP_PromoFood.[Kamar] as Kamar, IHP_PromoFood.Syarat_Jenis_kamar as Syarat_Jenis_kamar, IHP_PromoFood.Jenis_Kamar as Jenis_Kamar, IHP_PromoFood.Syarat_Durasi as Syarat_Durasi, IHP_PromoFood.Durasi as Durasi, IHP_PromoFood.Syarat_Hari as Syarat_Hari, IHP_PromoFood.[Hari] as hari, IHP_PromoFood.Syarat_Jam as Syarat_Jam, IHP_PromoFood.[Date_Start] as Date_Start, IHP_PromoFood.[Time_Start] as Time_Start, IHP_PromoFood.[Date_Finish] as Date_Finish, IHP_PromoFood.[Time_Finish] as Time_Finish, IHP_PromoFood.[Syarat_Quantity] as Syarat_Quantity, IHP_PromoFood.Quantity as Quantity, IHP_PromoFood.[Diskon_Persen] as Diskon_Persen, IHP_PromoFood.[Diskon_Rp] as Diskon_Rp, IHP_PromoFood.[Syarat_Inventory] as Syarat_Inventory, IHP_PromoFood.[Inventory] as Inventory, IHP_PromoFood.[Sign_Inventory] as Sign_Inventory, IHP_PromoFood.[Sign_Diskon_Persen] as Sign_Diskon_Persen, IHP_PromoFood.[Sign_Diskon_Rp] as Sign_Diskon_Rp, 1 as FlagExtend 
                  FROM
                     IHP_PromoFood , IHP_Rcp 
                  where
                     (
                        IHP_PromoFood.Kamar = '[NONE]' 
                        or IHP_PromoFood.Kamar = '${room}' 
                     )
                     and 
                     (
                        IHP_PromoFood.Hari = 0 
                        or IHP_PromoFood.Hari = 5 
                     )
                     and 
                     (
                        IHP_PromoFood.Jenis_Kamar = '[NONE]' 
                        or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}' 
                     )
                     and IHP_PromoFood.Status = 1 
                     and [IHP_PromoFood].[Promo_Food] = '${promo}' 
                     and IHP_Rcp.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpFoodExtendRoomOldTranferByRcpCheckOut ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukse prosesQuery getDeleteInsertIhpPromoRcpFoodExtendRoomOldTranferByRcpCheckOut ');
                  resolve(true);
               }
            });

         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getDeleteInsertIhpPromoRcpFoodExtendRoomByIhpRoomCheckout(db_, promo_, durasi_menit_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               insert into
               [IHP_Promo_Rcp] 
             select
             '${kode_rcp}' as Reception,
        IHP_PromoFood.[Promo_Food] as Promo,
      
        CONVERT(DATETIME,
        case
          when
            (
              IHP_Room.Jam_Checkout between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
            and 
            (
              DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Room.Jam_Checkout), 114), 1, 8) 
          when
            IHP_Room.Jam_Checkout between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Room.Jam_Checkout), 114), 1, 8) 
          when
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              - DATEDIFF(mi, 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                end
              )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
            )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              - DATEDIFF(mi, 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                end
              )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
            )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 8) 
        end
        ,103)
        as Start_Promo, 
      
        CONVERT(DATETIME,
        case
          when
            (
              IHP_Room.Jam_Checkout between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
            and 
            (
              DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Room.Jam_Checkout , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
            )
      , IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Room.Jam_Checkout , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
            )
      , IHP_Room.Jam_Checkout), 114), 1, 8) 
          when
            IHP_Room.Jam_Checkout between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Room.Jam_Checkout , 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
      ) 
            )
      , IHP_Room.Jam_Checkout), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Room.Jam_Checkout , 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
      ) 
            )
      , IHP_Room.Jam_Checkout), 114), 1, 8) 
            when
              DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            then
              CONVERT(VARCHAR(24), DATEADD(minute, 
              (
                0 
              )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
              (
                0 
              )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 8) 
        end
        ,103)
        as End_Promo,
        2 as Status_Promo, IHP_PromoFood.[Syarat_Kamar] as Syarat_Kamar, IHP_PromoFood.[Kamar] as Kamar, 
        IHP_PromoFood.Syarat_Jenis_kamar as Syarat_Jenis_kamar, 
        IHP_PromoFood.Jenis_Kamar as Jenis_Kamar, IHP_PromoFood.Syarat_Durasi as Syarat_Durasi, 
         IHP_PromoFood.Durasi as Durasi, 
         IHP_PromoFood.Syarat_Hari as Syarat_Hari, 
        IHP_PromoFood.[Hari] as hari, 
        IHP_PromoFood.Syarat_Jam as Syarat_Jam, IHP_PromoFood.[Date_Start] as Date_Start, 
        IHP_PromoFood.[Time_Start] as Time_Start, IHP_PromoFood.[Date_Finish] as Date_Finish, 
        IHP_PromoFood.[Time_Finish] as Time_Finish, 
        IHP_PromoFood.[Syarat_Quantity] as Syarat_Quantity, 
        IHP_PromoFood.Quantity as Quantity, 
        IHP_PromoFood.[Diskon_Persen] as Diskon_Persen, 
        IHP_PromoFood.[Diskon_Rp] as Diskon_Rp, 
        IHP_PromoFood.[Syarat_Inventory] as Syarat_Inventory, 
        IHP_PromoFood.[Inventory] as Inventory, 
        IHP_PromoFood.[Sign_Inventory] as Sign_Inventory, 
        IHP_PromoFood.[Sign_Diskon_Persen] as Sign_Diskon_Persen, 
       IHP_PromoFood.[Sign_Diskon_Rp] as Sign_Diskon_Rp, 
       1 as FlagExtend 
      
      FROM
        IHP_PromoFood 
        ,IHP_Rcp, IHP_Room 
      where
        (
          IHP_PromoFood.Kamar = '[NONE]' 
          or IHP_PromoFood.Kamar = '${room}'
        )
        and 
        (
          IHP_PromoFood.Hari = 0 
          or IHP_PromoFood.Hari = 5
        )
        and 
        (
          IHP_PromoFood.Jenis_Kamar = '[NONE]' 
          or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}'
        )
        and IHP_PromoFood.Status = 1
        and [IHP_PromoFood].[Promo_Food]='${promo}' 
        and IHP_Rcp.Reception='${kode_rcp}'
        and IHP_Room.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpFoodExtendRoomByIhpRoomCheckout ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses prosesQuery getDeleteInsertIhpPromoRcpFoodExtendRoomByIhpRoomCheckout ');
                  resolve(true);
               }
            });

         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getDeleteInsertIhpPromoRcpFoodMultipleExtendRoomByStartExtendIhpExt(db_, promo_, jenis_kamar_, room_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            var room = room_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               insert into
               [IHP_Promo_Rcp] 
             select
             '${kode_rcp}' as Reception,
        IHP_PromoFood.[Promo_Food] as Promo,
        CONVERT(DATETIME,
        case
          when
            (
              IHP_Ext.Start_Extend between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
            and 
            (
              DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Ext.Start_Extend), 114), 1, 8) 
          when
            IHP_Ext.Start_Extend between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              0 
            )
      , IHP_Ext.Start_Extend), 114), 1, 8) 
          when
            DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              - DATEDIFF(mi, 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                end
              )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
            )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              - DATEDIFF(mi, 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                end
              )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
            )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 114), 1, 8) 
        end
        ,103)
        as Start_Promo, 
      
        CONVERT(DATETIME,
        case
          when
            (
              IHP_Ext.Start_Extend between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
            and 
            (
              DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
            )
      , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)) 
            )
      , IHP_Ext.Start_Extend), 114), 1, 8) 
          when
            IHP_Ext.Start_Extend between ( 
            case
              when
                CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
              then
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              else
                DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
            end
      ) 
            and 
            (
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
              end
            )
          then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Ext.Start_Extend , 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
      ) 
            )
      , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
              DATEDIFF(mi, IHP_Ext.Start_Extend , 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
      ) 
            )
      , IHP_Ext.Start_Extend), 114), 1, 8) 
            when
              DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend) between ( 
              case
                when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                then
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
                else
                  DATEADD(day,  [IHP_PromoFood].[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Start])) 
              end
      ) 
              and 
              (
                case
                  when
                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                  else
                    DATEADD(day,  [IHP_PromoFood].[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' +  [IHP_PromoFood].[Time_Finish])) 
                end
              )
            then
              CONVERT(VARCHAR(24), DATEADD(minute, 
              (
                0 
              )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
              (
                0 
              )
      , DATEADD(minute, ((IHP_Ext.Jam_Extend*60)+IHP_Ext.Menit_Extend), IHP_Ext.Start_Extend)), 114), 1, 8) 
        end
        ,103)
        as End_Promo,
        2 as Status_Promo, IHP_PromoFood.[Syarat_Kamar] as Syarat_Kamar, IHP_PromoFood.[Kamar] as Kamar, 
        IHP_PromoFood.Syarat_Jenis_kamar as Syarat_Jenis_kamar, 
        IHP_PromoFood.Jenis_Kamar as Jenis_Kamar, IHP_PromoFood.Syarat_Durasi as Syarat_Durasi, 
         IHP_PromoFood.Durasi as Durasi, 
         IHP_PromoFood.Syarat_Hari as Syarat_Hari, 
        IHP_PromoFood.[Hari] as hari, 
        IHP_PromoFood.Syarat_Jam as Syarat_Jam, IHP_PromoFood.[Date_Start] as Date_Start, 
        IHP_PromoFood.[Time_Start] as Time_Start, IHP_PromoFood.[Date_Finish] as Date_Finish, 
        IHP_PromoFood.[Time_Finish] as Time_Finish, 
        IHP_PromoFood.[Syarat_Quantity] as Syarat_Quantity, 
        IHP_PromoFood.Quantity as Quantity, 
        IHP_PromoFood.[Diskon_Persen] as Diskon_Persen, 
        IHP_PromoFood.[Diskon_Rp] as Diskon_Rp, 
        IHP_PromoFood.[Syarat_Inventory] as Syarat_Inventory, 
        IHP_PromoFood.[Inventory] as Inventory, 
        IHP_PromoFood.[Sign_Inventory] as Sign_Inventory, 
        IHP_PromoFood.[Sign_Diskon_Persen] as Sign_Diskon_Persen, 
       IHP_PromoFood.[Sign_Diskon_Rp] as Sign_Diskon_Rp, 
       1 as FlagExtend 
      
      FROM
        IHP_PromoFood 
         ,IHP_Ext 
      where
        (
          IHP_PromoFood.Kamar = '[NONE]' 
          or IHP_PromoFood.Kamar = '${room}'
        )
        and 
        (
          IHP_PromoFood.Hari = 0 
          or IHP_PromoFood.Hari = 5
        )
        and 
        (
          IHP_PromoFood.Jenis_Kamar = '[NONE]' 
          or IHP_PromoFood.Jenis_Kamar = '${jenis_kamar}'
        )
        and IHP_PromoFood.Status = 1
        and IHP_PromoFood.Promo_Food='${promo}' 
        and IHP_Ext.Reception='${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpFoodMultipleExtendRoomByStartExtendIhpExt ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses prosesQuery getDeleteInsertIhpPromoRcpFoodMultipleExtendRoomByStartExtendIhpExt ');
                  resolve(true);
               }
            });

         } catch (error) {
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getPromoRcpFood(db_, kode_rcp_, flag_extend_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var flag_extend = flag_extend_;
            var isiQuery = "" +
               `select distinct Promo as promo from IHP_Promo_Rcp where Reception='${kode_rcp}' 
            and FlagExtend=${flag_extend} 
            and Status_Promo=2`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     dataResponse = new ResponseFormat(true, dataReturn.recordset);
                     if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                        console.log("promo rcp " + dataReturn.recordset[0].promo);
                        logger.info("promo rcp " + dataReturn.recordset[0].promo);
                     }
                     resolve(dataResponse);
                  }
                  else {
                     resolve(false);
                  }
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getRequirementPromoFood(db_, promo) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo_rcp_query = "Select " +
               //" SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,2) as jamsekarang, " +
               " SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,2)+" +
               " SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),4,2)+" +
               " SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),7,2) as jamsekarang," +
               " Promo_Food , " +
               " Syarat_Kamar, " +
               " Kamar, " +
               " Syarat_Jenis_kamar, " +
               " Jenis_Kamar, " +
               " Syarat_Durasi, " +
               " Durasi, " +
               " Syarat_Hari, " +
               " Hari, " +
               " Syarat_Jam, " +
               " Date_Start, " +
               //" Time_Start, " +
               " SUBSTRING(Time_Start,1,2)+" +
               " SUBSTRING(Time_Start,4,2)+" +
               " SUBSTRING(Time_Start,7,2) as Time_Start," +
               " Date_Finish, " +
               " SUBSTRING(Time_Finish,1,2)+" +
               " SUBSTRING(Time_Finish,4,2)+" +
               " SUBSTRING(Time_Finish,7,2) as Time_Finish," +
               //" Time_Finish, " +
               " Syarat_Inventory, " +
               " Inventory, " +
               " Syarat_Quantity, " +
               " Quantity, " +
               " Sign_Inventory, " +
               " Sign_Diskon_Persen, " +
               " Diskon_Persen, " +
               " Sign_Diskon_Rp, " +
               " Diskon_Rp  " +
               " from IHP_PromoFood where  Promo_Food ='" + promo + "' and Status='1'";
            db.request().query(promo_rcp_query, function (err, dataReturn) {
               if (err) {
                  logger.error(err.message);
                  resolve(false);
               } else {
                  if (dataReturn.recordset.length > 0) {
                     var jam_sekarang = parseInt(dataReturn.recordset[0].jamsekarang);
                     var Syarat_Jam1 = parseInt(dataReturn.recordset[0].Syarat_Jam);
                     var start_date_dini_hari = parseInt(dataReturn.recordset[0].Date_Start);
                     var finish_date_dini_hari = parseInt(dataReturn.recordset[0].Date_Finish);
                     var Promo = dataReturn.recordset[0].Promo_Food;
                     var Time_Start = parseInt(dataReturn.recordset[0].Time_Start);
                     var Time_Finish = parseInt(dataReturn.recordset[0].Time_Finish);
                     var Syarat_Inventory1 = parseInt(dataReturn.recordset[0].Syarat_Inventory);
                     var Syarat_Kamar1 = parseInt(dataReturn.recordset[0].Syarat_Kamar);
                     var Syarat_Jenis_kamar1 = parseInt(dataReturn.recordset[0].Syarat_Jenis_kamar);
                     var Syarat_Durasi1 = parseInt(dataReturn.recordset[0].Syarat_Durasi);
                     var Syarat_Hari1 = parseInt(dataReturn.recordset[0].Syarat_Hari);
                     var Syarat_Quantity1 = parseInt(dataReturn.recordset[0].Syarat_Quantity);

                     //syarat jam
                     if (Syarat_Jam1 == 1) {
                        if (start_date_dini_hari == 0) {
                           if (finish_date_dini_hari == 0) {
                              if ((jam_sekarang >= Time_Start) && (jam_sekarang < Time_Finish)) {
                                 resolve(true);
                              } else if ((jam_sekarang >= Time_Finish) && (jam_sekarang < 240000)) {
                                 resolve(false);
                              }
                           } else if (finish_date_dini_hari == 1) {
                              if ((jam_sekarang >= Time_Start) && (jam_sekarang <= 240000)) {
                                 resolve(true);
                              } else if ((jam_sekarang >= 0) && (jam_sekarang < Time_Finish)) {
                                 resolve(true);
                              } else if ((jam_sekarang >= Time_Finish) && (jam_sekarang < Time_Start)) {
                                 resolve(false);
                              }
                           }
                        } else if (start_date_dini_hari == 1) {
                           if (finish_date_dini_hari == 1) {
                              if ((jam_sekarang >= Time_Start) && (jam_sekarang < Time_Finish)) {
                                 resolve(true);
                              } else if ((jam_sekarang >= Time_Finish) && (jam_sekarang < 240000)) {
                                 resolve(false);
                              } else if ((jam_sekarang >= 0) && (jam_sekarang < Time_Start)) {
                                 resolve(false);
                              }
                           }
                        }
                     }
                     //syarat Inventory
                     else if (Syarat_Inventory1 == 1) {
                        resolve(true);
                     }
                     //syarat Kamar
                     else if (Syarat_Kamar1 == 1) {
                        resolve(true);
                     }
                     //syarat Jenis Kamar
                     else if (Syarat_Jenis_kamar1 == 1) {
                        resolve(true);
                     }
                     //syarat Durasi
                     else if (Syarat_Durasi1 == 1) {
                        resolve(true);
                     }
                     //syarat Hari
                     else if (Syarat_Hari1 == 1) {
                        resolve(true);
                     }
                     //syarat Quantity
                     else if (Syarat_Quantity1 == 1) {
                        resolve(true);
                     } else {
                        resolve(false);
                     }
                  } else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

   getNamePromoFood(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo_rcp_query = "Select Distinct Promo as Promo from IHP_Promo_Rcp where  Reception ='" + kode_rcp + "' and Status_Promo='2'";
            db.request().query(promo_rcp_query, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err.message);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     var nama_promo = dataReturn.recordset[0].Promo;
                     resolve(nama_promo);
                  } else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

   getPotonganPromoFood(db_, price, promo, inventry_item, jumlah_pesanan, room, jenis_room, durasi_cekin, hari_cekin) {
      return new Promise((resolve, reject) => {
         try {
            var db = db_;
            var potongan_promo_query = "" +
               " Select " +
               "   Promo_Food, " +
               "   Syarat_Kamar, " +
               "   Kamar, " +
               "   Syarat_Jenis_kamar, " +
               "   Jenis_Kamar, " +
               "   Syarat_Durasi, " +
               "   Durasi, " +
               "   Syarat_Hari, " +
               "   Hari, " +
               "   Syarat_Jam, " +
               "   Date_Start, " +
               "   Time_Start, " +
               "   Date_Finish, " +
               "   Time_Finish, " +
               "   Syarat_Inventory, " +
               "   Inventory, " +
               "   Syarat_Quantity, " +
               "   Quantity, " +
               "   Sign_Inventory, " +
               "   Sign_Diskon_Persen, " +
               "   Diskon_Persen, " +
               "   Sign_Diskon_Rp, " +
               "   Diskon_Rp " +
               " from " +
               " IHP_PromoFood " +
               " where Promo_Food ='" + promo + "' and Status='1'";

            var harga = parseInt(price);
            db.request().query(potongan_promo_query, function (err, dataReturn) {
               if (err) {
                  logger.error(err.message);
                  resolve(false);
               } else {
                  var total_potongan;
                  if (dataReturn.recordset.length > 0) {
                     var Durasi_cek_in1 = parseInt(durasi_cekin);
                     var hari_cekin1 = parseInt(hari_cekin) + 1;
                     var jumlah_pesanan1 = parseInt(jumlah_pesanan);
                     var Hari1 = dataReturn.recordset[0].Hari;
                     var Inventory1 = dataReturn.recordset[0].Inventory;
                     var Kamar1 = dataReturn.recordset[0].Kamar;
                     var Jenis_Kamar1 = dataReturn.recordset[0].Jenis_Kamar;
                     var Durasi1 = parseInt(dataReturn.recordset[0].Durasi);
                     var Quantity1 = parseInt(dataReturn.recordset[0].Quantity);
                     var Syarat_Jam1 = parseInt(dataReturn.recordset[0].Syarat_Jam);
                     var Syarat_Inventory1 = parseInt(dataReturn.recordset[0].Syarat_Inventory);
                     var Syarat_Quantity1 = parseInt(dataReturn.recordset[0].Syarat_Quantity);
                     var Sign_Diskon_Persen1 = parseInt(dataReturn.recordset[0].Sign_Diskon_Persen);
                     var Sign_Diskon_Rp1 = parseInt(dataReturn.recordset[0].Sign_Diskon_Rp);
                     var Diskon_Persen1 = parseInt(dataReturn.recordset[0].Diskon_Persen);
                     var Diskon_Rp1 = parseInt(dataReturn.recordset[0].Diskon_Rp);
                     var Syarat_Kamar1 = parseInt(dataReturn.recordset[0].Syarat_Kamar);
                     var Syarat_Jenis_kamar1 = parseInt(dataReturn.recordset[0].Syarat_Jenis_kamar);
                     var Syarat_Durasi1 = parseInt(dataReturn.recordset[0].Syarat_Durasi);
                     var Syarat_Hari1 = parseInt(dataReturn.recordset[0].Syarat_Hari);

                     if (Syarat_Inventory1 == 1) {
                        if (inventry_item == Inventory1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Jam1 == 1) {
                        if (Sign_Diskon_Persen1 == 1) {
                           total_potongan = ((harga / 100) * Diskon_Persen1);
                           resolve(total_potongan);
                        } else if (Sign_Diskon_Rp1 == 1) {
                           total_potongan = Diskon_Rp1;
                           resolve(total_potongan);
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Kamar1 == 1) {
                        if (Kamar1 == room) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Jenis_kamar1 == 1) {
                        if (Jenis_Kamar1 == jenis_room) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Durasi1 == 1) {
                        if (Durasi_cek_in1 >= Durasi1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Hari1 == 1) {
                        if (Hari1 == hari_cekin1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else if (Syarat_Quantity1 == 1) {
                        if (jumlah_pesanan1 >= Quantity1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_potongan = ((harga / 100) * Diskon_Persen1);
                              resolve(total_potongan);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_potongan = Diskon_Rp1;
                              resolve(total_potongan);
                           }
                        } else {
                           resolve(0);
                        }
                     } else {
                        resolve(0);
                     }
                  } else {
                     resolve(0);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

   getFinalPriceAfterPotonganPromoFood(db_, price, promo, inventry_item, jumlah_pesanan, room, jenis_room, durasi_cekin, hari_cekin) {
      return new Promise((resolve, reject) => {
         try {
            var db = db_;
            var potongan_promo_query = "Select " +
               " Promo_Food, " +
               " Syarat_Kamar, " +
               " Kamar, " +
               " Syarat_Jenis_kamar, " +
               " Jenis_Kamar, " +
               " Syarat_Durasi, " +
               " Durasi, " +
               " Syarat_Hari, " +
               " Hari, " +
               " Syarat_Jam, " +
               " Date_Start, " +
               " Time_Start, " +
               " Date_Finish, " +
               " Time_Finish, " +
               " Syarat_Inventory, " +
               " Inventory, " +
               " Syarat_Quantity, " +
               " Quantity, " +
               " Sign_Inventory, " +
               " Sign_Diskon_Persen, " +
               " Diskon_Persen, " +
               " Sign_Diskon_Rp, " +
               " Diskon_Rp " +
               " from IHP_PromoFood where  Promo_Food ='" + promo + "' and Status='1'";

            var harga = parseInt(price);
            db.request().query(potongan_promo_query, function (err, dataReturn) {
               if (err) {
                  logger.error(err.message);
                  resolve(false);
               } else {
                  var total_price;
                  if (dataReturn.recordset.length > 0) {
                     var Inventory1 = dataReturn.recordset[0].Inventory;
                     var Kamar1 = dataReturn.recordset[0].Kamar;
                     var Jenis_Kamar1 = dataReturn.recordset[0].Jenis_Kamar;
                     var Durasi1 = parseInt(dataReturn.recordset[0].Durasi);
                     var Quantity1 = parseInt(dataReturn.recordset[0].Quantity);
                     var Durasi_cek_in1 = parseInt(durasi_cekin);
                     var hari_cekin1 = parseInt(hari_cekin) + 1;
                     var jumlah_pesanan1 = parseInt(jumlah_pesanan);
                     var Hari1 = dataReturn.recordset[0].Hari;
                     var Syarat_Jam1 = parseInt(dataReturn.recordset[0].Syarat_Jam);
                     var Syarat_Inventory1 = parseInt(dataReturn.recordset[0].Syarat_Inventory);
                     var Syarat_Quantity1 = parseInt(dataReturn.recordset[0].Syarat_Quantity);
                     var Sign_Inventory1 = parseInt(dataReturn.recordset[0].Sign_Inventory);
                     var Sign_Diskon_Persen1 = parseInt(dataReturn.recordset[0].Sign_Diskon_Persen);
                     var Sign_Diskon_Rp1 = parseInt(dataReturn.recordset[0].Sign_Diskon_Rp);
                     var Diskon_Persen1 = parseInt(dataReturn.recordset[0].Diskon_Persen);
                     var Diskon_Rp1 = parseInt(dataReturn.recordset[0].Diskon_Rp);
                     var Syarat_Kamar1 = parseInt(dataReturn.recordset[0].Syarat_Kamar);
                     var Syarat_Jenis_kamar1 = parseInt(dataReturn.recordset[0].Syarat_Jenis_kamar);
                     var Syarat_Durasi1 = parseInt(dataReturn.recordset[0].Syarat_Durasi);
                     var Syarat_Hari1 = parseInt(dataReturn.recordset[0].Syarat_Hari);

                     if (Syarat_Inventory1 == 1) {
                        if (inventry_item == Inventory1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Jam1 == 1) {
                        if (Sign_Diskon_Persen1 == 1) {
                           total_price = harga - ((harga / 100) * Diskon_Persen1);
                           resolve(total_price);
                        } else if (Sign_Diskon_Rp1 == 1) {
                           total_price = harga - Diskon_Rp1;
                           resolve(total_price);
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Kamar1 == 1) {
                        if (Kamar1 == room) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Jenis_kamar1 == 1) {
                        if (Jenis_Kamar1 == jenis_room) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Durasi1 == 1) {
                        if (Durasi_cek_in1 >= Durasi1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Hari1 == 1) {
                        if (Hari1 == hari_cekin1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else if (Syarat_Quantity1 == 1) {
                        if (jumlah_pesanan1 >= Quantity1) {
                           if (Sign_Diskon_Persen1 == 1) {
                              total_price = harga - ((harga / 100) * Diskon_Persen1);
                              resolve(total_price);
                           } else if (Sign_Diskon_Rp1 == 1) {
                              total_price = harga - Diskon_Rp1;
                              resolve(total_price);
                           }
                        } else {
                           resolve(harga);
                        }
                     } else {
                        resolve(harga);
                     }
                  } else {
                     resolve(harga);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

   updateIhpSodAfterEditPromoFood(db_, slip_order_, inventory_, qty_, price_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var price = price_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "Update [dbo].[IHP_Sod] " +
               " set [Price]=" + price + "" +
               ",[Total]=" + qty * price + "" +
               " where SlipOrder='" + slip_order + "'" +
               " and Inventory='" + inventory + "'" +
               " and Qty=" + qty + "";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   updateIhpOkdAfterEditPromoFood(db_, slip_order_, inventory_, qty_, price_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var price = price_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "Update [dbo].[IHP_Okd] " +
               " set [Price]=" + price + "" +
               ",[Total]=" + qty * price + "" +
               " where SlipOrder='" + slip_order + "'" +
               " and Inventory='" + inventory + "'" +
               " and Qty=" + qty + "";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   updateIhpOcdAfterEditPromoFood(db_, slip_order_, inventory_, qty_, price_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var price = price_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "Update [dbo].[IHP_Ocd] " +
               " set [Price]=" + price + "" +
               ",[Total]=" + qty * price + "" +
               " where SlipOrder='" + slip_order + "'" +
               " and Inventory='" + inventory + "'" +
               " and Qty=" + qty + "";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   insertIhpSodPromoAfterEditPromoFoo(db_, slip_order_, inventory_, qty_, final_potongan_promo_, promo_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var final_potongan_promo = final_potongan_promo_;
            var promo = promo_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "insert [dbo].[IHP_Sod_Promo] " +
               "([SlipOrder]" +
               ",[Inventory]" +
               ",[Promo_Food]" +
               ",[Harga_Promo]" +
               ")" +
               "VALUES" +
               "(" +
               " '" + slip_order + "'," +
               " '" + inventory + "'," +
               " '" + promo + "'," +
               "" + qty * final_potongan_promo + "" +
               ")";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   insertIhpOkdPromoAfterEditPromoFood(db_, slip_order_, inventory_, qty_, final_potongan_promo_, promo_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var final_potongan_promo = final_potongan_promo_;
            var promo = promo_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "insert [dbo].[IHP_Okd_Promo] " +
               "(" +
               "[OrderPenjualan] " +
               ",[Inventory] " +
               ",[Promo_Food] " +
               ",[Harga_Promo] " +
               ",[SlipOrder] " +
               ")" +
               " select " +
               " [OrderPenjualan], " +
               " [Inventory], " +
               "'" + promo + "'," +
               "" + qty * final_potongan_promo + "," +
               " [SlipOrder] " +
               " From " +
               " IHP_Okd where " +
               " SlipOrder='" + slip_order + "' " +
               " And Inventory ='" + inventory + "' " +
               " and Qty= " + qty;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   insertIhpOcdPromoAfterEditPromoFood(db_, slip_order_, inventory_, qty_, final_potongan_promo_, promo_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var slip_order = slip_order_;
            var inventory = inventory_;
            var qty = qty_;
            var final_potongan_promo = final_potongan_promo_;
            var promo = promo_;

            var isiQuery = "" +
               "set dateformat dmy " +
               "insert [dbo].[IHP_Ocd_Promo] " +
               "(" +
               "[OrderCancelation] " +
               ",[Inventory] " +
               ",[Promo_Food] " +
               ",[Harga_Promo] " +
               ",[OrderPenjualan] " +
               ",[SlipOrder] " +
               ")" +
               " select " +
               "[OrderCancelation]," +
               "[Inventory], " +
               "'" + promo + "'," +
               "" + qty * final_potongan_promo + "," +
               " [OrderPenjualan], " +
               " [SlipOrder] " +
               " From " +
               " IHP_Ocd where " +
               " SlipOrder='" + slip_order + "' " +
               " And Inventory ='" + inventory + "' " +
               " and Qty= " + qty;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   updateIhpOklAfterEditPromoFood(db_, order_penjualan_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var order_penjualan = order_penjualan_;

            var isiQuery = "" +
               `
               UPDATE
   IHP_Okl_ 
SET
   IHP_Okl_.Total = IHP_Okd_.total_penjualan , IHP_Okl_.Discount = 
   (
      IHP_Okd_.total_penjualan / 100
   )
   *isnull(IHP_Mbr.Diskon_Food, 0), Service = 
   (
(IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100 
   )
   * IHP_Config2.Service_Persen_Food , Tax = 
   (
(IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) + (((IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food) 
   )
   / 100*IHP_Config2.Tax_Persen_Food , TotalValue = 
   (
      IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0)) 
   )
   + (((IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food) + (((IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) + (((IHP_Okd_.total_penjualan - ((IHP_Okd_.total_penjualan / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food)) / 100*IHP_Config2.Tax_Persen_Food) 
FROM
   IHP_Okl AS IHP_Okl_ 
   Inner JOIN
      (
         SELECT
            OrderPenjualan,
            SUM(Total) total_penjualan 
         FROM
            IHP_Okd 
         where
            OrderPenjualan = '${order_penjualan}' 
         GROUP BY
            OrderPenjualan 
      )
      IHP_Okd_ 
      ON IHP_Okl_.OrderPenjualan = IHP_Okd_.OrderPenjualan 
   Left Join
      IHP_Mbr 
      On IHP_Okl_.Member = IHP_Mbr.Member,
      IHP_Config2 
WHERE
   IHP_Okl_.OrderPenjualan = '${order_penjualan}' 
   and IHP_Config2.Data = '1'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(order_penjualan + " sukses updateIhpOklAfterEditPromoFood");
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   updateIhpOclAfterEditPromoFood(db_, order_cancelation_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;

            var order_cancelation = order_cancelation_;

            var isiQuery = "" +
               `
               UPDATE
   IHP_Ocl_ 
SET
   IHP_Ocl_.Charge = IHP_Ocd_.total_cancelation , IHP_Ocl_.Discount = 
   (
      IHP_Ocd_.total_cancelation / 100
   )
   *isnull(IHP_Mbr.Diskon_Food, 0), Service = 
   (
(IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100 
   )
   * IHP_Config2.Service_Persen_Food , Tax = 
   (
(IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) + (((IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food) 
   )
   / 100*IHP_Config2.Tax_Persen_Food , Total = 
   (
      IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))
   )
   + (((IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food) + (((IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) + (((IHP_Ocd_.total_cancelation - ((IHP_Ocd_.total_cancelation / 100)*isnull(IHP_Mbr.Diskon_Food, 0))) / 100)* IHP_Config2.Service_Persen_Food)) / 100*IHP_Config2.Tax_Persen_Food) 
FROM
   IHP_Ocl AS IHP_Ocl_ 
   Inner JOIN
      (
         SELECT
            OrderCancelation,
            SUM(Total) total_cancelation 
         FROM
            IHP_Ocd 
         where
            OrderCancelation = '${order_cancelation}' 
         GROUP BY
            OrderCancelation 
      )
      IHP_Ocd_ 
      ON IHP_Ocl_.OrderCancelation = IHP_Ocl_.OrderCancelation 
   Left Join
      IHP_Mbr 
      On IHP_Ocl_.Member = IHP_Mbr.Member,
      IHP_Config2 
WHERE
   IHP_Ocl_.OrderCancelation = '${order_cancelation}' 
   and IHP_Config2.Data = '1'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(order_cancelation + " sukses updateIhpOclAfterEditPromoFood");
                  resolve(true);
               }
            });

         } catch (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   getOrderPenjualanAfterEditPromoFood(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo_rcp_query = "Select Distinct OrderPenjualan as order_penjualan from IHP_Okl where Reception ='" + kode_rcp + "'";
            db.request().query(promo_rcp_query, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err.message);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     resolve(dataReturn);
                  } else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

   getOrderCancelationAfterEditPromoFood(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo_rcp_query = "Select Distinct OrderCancelation as order_cancelation from IHP_Ocl where Reception ='" + kode_rcp + "'";
            db.request().query(promo_rcp_query, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err.message);
                  resolve(false);
               } else {
                  sql.close();
                  if (dataReturn.recordset.length > 0) {
                     resolve(dataReturn);
                  } else {
                     resolve(false);
                  }
               }
            });
         } catch (error) {
            logger.error(error);
            resolve(false);
         }
      });
   }

}

module.exports = PromoFood;