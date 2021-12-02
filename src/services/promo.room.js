var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var dataResponse;

class PromoRoom {
   constructor() { }

   getTotalPromoRoom(db_, rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var rcp = rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `
          set
   dateformat dmy 
   select
      [IHP_Rcp].[Reception] as reception,
      CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 114), 1, 12) as checkin,
      [IHP_Rcp].[Jam_Sewa] as jam_sewa,
      [IHP_Rcp].[Menit_Sewa] as menit_sewa,
      CONVERT(VARCHAR(24), [IHP_Rcp].[Checkout], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkout], 114), 1, 12) as checkout,
      [IHP_Promo_Rcp].[Promo],
      [IHP_Promo_Rcp].[Start_Promo],
      [IHP_Promo_Rcp].[End_promo],
      [IHP_Promo_Rcp].[Diskon_Persen],
      [IHP_Promo_Rcp].[Diskon_Rp],
      case
         when
            [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            1 
         else
            0 
      end
      as checkin_in_start_promo_and_finish_promo , 
      case
         when
            [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            1 
         else
            0 
      end
      as checkout_in_start_promo_and_finish_promo , 
      case
         when
            [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            1 
         else
            0 
      end
      as start_promo_in_checkin_and_checkout , 
      case
         when
            [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            1 
         else
            0 
      end
      as end_promo_in_checkin_and_checkout, DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) as different_checkin_and_end_promo, DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) as different_start_promo_and_checkout , 
      case
         when
            [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            1 
         when
            [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            3 
         when
            [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            2 
         else
            0 
      end
      as awal_tengah_akhir , 
      case
         when
            [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
         when
            [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
         when
            [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
         else
            0 
      end
      as menit_yang_mendapakan_promo , 
      case
         when
            --jika promo di separo awal checkin saja
            [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
         when
            --jika promo di separo akhir checkin saja
            [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
         when
            --jika promo di seluruh checkin checkout
            [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
      end
      as hasil_end_promo , 
      case
         when
            --jika promo di separo awal checkin saja
            [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
         when
            --jika promo di separo akhir checkin saja
            [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
         when
            --jika promo di seluruh checkin checkout
            [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
            )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
      end
      as hasil_start_promo , [IHP_Rcp_DetailsRoom].[Overpax] as tarif_overpax, [IHP_Rcp_DetailsRoom].[Tarif] as tarif_kamar, 
      case
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as start_promo_in_range_time_start_time_finish , 
      case
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as finish_promo_in_range_time_start_time_finish , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between ( ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) ) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
         then
            1 
         else
            0 
      end
      as time_start_in_range_start_promo_finish_promo , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Finish] between ( ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) ) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
         then
            1 
         else
            0 
      end
      as time_finish_in_range_start_promo_and_end_promo , DATEDIFF(mi, 
      (
( 
         case
            when
               --jika promo di separo awal checkin saja
               [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            when
               --jika promo di separo akhir checkin saja
               [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            when
               --jika promo di seluruh checkin checkout
               [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
               )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
         end
) 
      )
, [IHP_Rcp_DetailsRoom].[Time_Finish] ) as different_start_promo_and_time_finish , DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
      (
         case
            when
               --jika promo di separo awal checkin saja
               [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
            when
               --jika promo di separo akhir checkin saja
               [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
            when
               --jika promo di seluruh checkin checkout
               [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            then
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
         end
      )
) as different_time_start_and_end_promo , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
         then
            2 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
            and 
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            4 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            3 
         else
            0 
      end
      as awal_tengah_akhir , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
         then
            60 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
            and 
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
, [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
) 
         else
            0 
      end
      as menit_yang_digunakan , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
            case
               when
                  --jika promo di separo awal checkin saja
                  [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di separo akhir checkin saja
                  [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               when
                  --jika promo di seluruh checkin checkout
                  [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                  (
                     - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                  )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
            end
) 
            and 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 100)*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
            and 
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
               end
            )
, [IHP_Rcp_DetailsRoom].[Time_Finish] )) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
            between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
)) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         else
            0 
      end
      as promo_yang_didapatkan 
   from
      [IHP_Rcp] 
      INNER Join
         [IHP_Promo_Rcp] 
         on [IHP_Promo_Rcp].[Reception] = [IHP_Rcp].[Reception] 
      INNER Join
         [IHP_Rcp_DetailsRoom] 
         on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
   where
      [IHP_Rcp].[Reception] = '${rcp}' 
      and [IHP_Promo_Rcp].[FlagExtend] = 0 
      and [IHP_Promo_Rcp].[Status_Promo] = 1
          `;


            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  var promo_kamar = parseFloat(0);
                  if (dataReturn.recordset.length > 0) {
                     for (var a = 0; a < dataReturn.recordset.length; a++) {
                        var promo_kamar_ = dataReturn.recordset[a].promo_yang_didapatkan;
                        var promo_kamar__ = parseFloat(promo_kamar_);
                        promo_kamar = promo_kamar + promo_kamar__;

                        console.log(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " promo room yang di dapatkan=" + dataReturn.recordset[a].promo_yang_didapatkan);
                        logger.info(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " promo room yang di dapatkan=" + dataReturn.recordset[a].promo_yang_didapatkan);
                     }
                     console.log(rcp + " total promo room " + promo_kamar);
                     logger.info(rcp + " total promo room " + promo_kamar);

                     resolve(promo_kamar);
                  }
                  else {
                     console.log(rcp + " Promo Room 0 ");
                     logger.info(rcp + " Promo Room 0 ");
                     resolve(promo_kamar);
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

   getTotalPromoExtendRoom(db_, rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var rcp = rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `
               set
   dateformat dmy 
   select

      case
         when
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
            and 
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
         then
            4 
         when
            (
               [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
            and 
            (
               [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
         then
            2 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            3 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            1 
         else
            0 
      end
      as awal_tengah_akhir, 
      case
         when
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
            and 
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
         then
            DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo]) 
         when
            (
               [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
            and 
            (
               [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
         then
            DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo]) 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
) 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            DATEDIFF(mi, 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
            )
, [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         else
            0 
      end
      as menit_yang_digunakan, 
      case
         when
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
            and 
            (
( ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            )
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60) * DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo]) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
               [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
            and 
            (
               [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) 
               and 
               (
                  case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
               )
            )
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60) * DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo]) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60) * DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkout]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
               end
            )
) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         when
            (
( 
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
(([IHP_Rcp_DetailsRoom].[Tarif] / 60) * DATEDIFF(mi, 
            (
               case
                  when
                     --jika promo di separo awal checkin saja
                     [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di separo akhir checkin saja
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
, [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                     )
, [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                  when
                     --jika promo di seluruh checkin checkout
                     [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  then
                     CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                     )
, CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                     (
                        isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                     )
, [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
               end
            )
, [IHP_Rcp_DetailsRoom].[Time_Finish] ) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
         else
            0 
      end
      as promo_yang_didapatkan 
   from
      [IHP_Rcp] 
      left Join
         [IHP_Ext] 
         on [IHP_Rcp].[Reception] = [IHP_Ext].[Reception] 
      INNER Join
         [IHP_Promo_Rcp] 
         on [IHP_Promo_Rcp].[Reception] = [IHP_Rcp].[Reception] 
      INNER Join
         [IHP_Rcp_DetailsRoom] 
         on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
   where
      [IHP_Rcp].[Reception] = '${rcp}'
      and [IHP_Promo_Rcp].[FlagExtend] = 1 
      and [IHP_Promo_Rcp].[Status_Promo] = 1 
   Group By
      [IHP_Rcp].[Reception], [IHP_Rcp].[Checkin], [IHP_Rcp].[Jam_Sewa], [IHP_Rcp].[Menit_Sewa], [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[Promo] , [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] , [IHP_Promo_Rcp].[Diskon_Persen] , [IHP_Promo_Rcp].[Diskon_Rp] , [IHP_Rcp_DetailsRoom].[Overpax] , [IHP_Rcp_DetailsRoom].[Tarif] , [IHP_Rcp_DetailsRoom].[Time_Start] , [IHP_Rcp_DetailsRoom].[Time_Finish] 
      `;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  var promo_kamar = parseFloat(0);
                  if (dataReturn.recordset.length > 0) {
                     for (var a = 0; a < dataReturn.recordset.length; a++) {
                        var promo_kamar_ = dataReturn.recordset[a].promo_yang_didapatkan;
                        var promo_kamar__ = parseFloat(promo_kamar_);
                        promo_kamar = promo_kamar + promo_kamar__;

                        console.log(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " promo extend room yang di dapatkan=" + dataReturn.recordset[a].promo_yang_didapatkan);
                        logger.info(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " promo extend room yang di dapatkan=" + dataReturn.recordset[a].promo_yang_didapatkan);

                     }
                     console.log(rcp + " Promo Room extend " + promo_kamar);
                     logger.info(rcp + " Promo Room extend " + promo_kamar);

                     resolve(promo_kamar);
                  }
                  else {
                     console.log(rcp + " Promo Room extend 0 ");
                     logger.info(rcp + " Promo Room extend 0 ");
                     resolve(promo_kamar);
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

   getPromoRoomByRcpCheckin(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
            select
   IHP_PromoRoom.[Promo_Room] as promo_room,
   IHP_PromoRoom.[Hari] as hari,
   IHP_PromoRoom.[Room] as room,
   IHP_PromoRoom.[Date_Start] as date_start,
   IHP_PromoRoom.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
   end
   as date_time_start, IHP_PromoRoom.[Date_Finish] as date_finish, IHP_PromoRoom.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Rcp.Checkin BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
         end
      then
         '1' 
      else
         '0' 
   end
   as status_jam_sekarang_masuk_masa_promo , DATEDIFF(mi, IHP_Rcp.Checkin, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
) as wisa_waktu_promo_hari_ini_menit , IHP_PromoRoom.[Diskon_Persen] as diskon_persen, IHP_PromoRoom.[Diskon_Rp] as diskon_rp, IHP_PromoRoom.[Khusus] as khusus , 
   case
      when
         IHP_PromoRoom.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoRoom.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as keterangan_khusus, IHP_PromoRoom.[Status] as status_aktif, IHP_Rcp.Checkin as checkin, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) as checkout, 
   case
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            IHP_Rcp.Checkin between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
      then
         2 
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            end
         )
      then
         1 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            end
         )
      then
         3 
      else
         0 
   end
   as awal_tengah_akhir, DATEDIFF(mi, IHP_Rcp.Checkin , 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                     else
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkin), 114), 1, 12) 
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkin), 114), 1, 12) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 12) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkin), 114), 1, 12) 
      when
         IHP_Rcp.Checkin between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkin), 114), 1, 12) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 12) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoRoom , IHP_Rcp 
where
   (
      IHP_PromoRoom.Room = '[NONE]' 
      or IHP_PromoRoom.Room = '${jenis_kamar}' 
   )
   and 
   (
      IHP_PromoRoom.Hari = 0 
      or IHP_PromoRoom.Hari = 5 
   )
   and IHP_PromoRoom.Status = 1 
   and IHP_PromoRoom.Promo_Room = '${promo}' 
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
                        console.log(kode_rcp + " promo room " + promo_ +
                           " start " + dataReturn.recordset[0].hasil_start_promo +
                           " finish " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info(kode_rcp + " promo room " + promo_ +
                           " start " + dataReturn.recordset[0].hasil_start_promo +
                           " finish " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log(kode_rcp + " promo room " + promo_ + " Promo Room tidak Berlaku");
                        logger.info(kode_rcp + " promo room " + promo_ + " Promo Room tidak Berlaku");
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

   getPromoRoomExtendByJamCheckoutIhpRoom(db_, promo_, durasi_menit_, kode_rcp_, jenis_kamar_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               select
   IHP_PromoRoom.[Promo_Room] as promo_room,
   IHP_PromoRoom.[Hari] as hari,
   IHP_PromoRoom.[Room] as room,
   IHP_PromoRoom.[Date_Start] as date_start,
   IHP_PromoRoom.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
   end
   as date_time_start, IHP_PromoRoom.[Date_Finish] as date_finish, IHP_PromoRoom.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Room.Jam_Checkout BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
) as wisa_waktu_promo_hari_ini_menit , IHP_PromoRoom.[Diskon_Persen] as diskon_persen, IHP_PromoRoom.[Diskon_Rp] as diskon_rp, IHP_PromoRoom.[Khusus] as khusus , 
   case
      when
         IHP_PromoRoom.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoRoom.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as keterangan_khusus, IHP_PromoRoom.[Status] as status_aktif, IHP_Room.Jam_Checkout as checkin, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) as checkout, 
   case
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                     else
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Room.Jam_Checkout), 114), 1, 12) 
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
) 
         )
, IHP_Room.Jam_Checkout), 114), 1, 12) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 12) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Room.Jam_Checkout), 114), 1, 12) 
      when
         IHP_Room.Jam_Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Room.Jam_Checkout), 114), 1, 12) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 12) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoRoom , IHP_Rcp , IHP_Room 
where
   (
      IHP_PromoRoom.Room = '[NONE]' 
      or IHP_PromoRoom.Room = '${jenis_kamar}' 
   )
   and 
   (
      IHP_PromoRoom.Hari = 0 
      or IHP_PromoRoom.Hari = 5 
   )
   and IHP_PromoRoom.Status = 1 
   and IHP_PromoRoom.Promo_Room = '${promo}' 
   and IHP_Rcp.Reception = '${kode_rcp}' 
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
                           " promo room start " + dataReturn.recordset[0].hasil_start_promo +
                           " promo room finish " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info(kode_rcp + " promo " + promo_ +
                           " promo room start " + dataReturn.recordset[0].hasil_start_promo +
                           " promo room finish " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log(kode_rcp + " promo " + promo_ + " Promo Room tidak Berlaku");
                        logger.info(kode_rcp + " promo " + promo_ + " Promo Room tidak Berlaku");
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

   getPromoRoomExtendByJamStartExtendIhpExt(db_, promo_, durasi_menit_, kode_rcp_, jenis_kamar_, start_extned_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var start_extned = start_extned_;
            var jenis_kamar = jenis_kamar_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               select
   IHP_PromoRoom.[Promo_Room] as promo_room,
   IHP_PromoRoom.[Hari] as hari,
   IHP_PromoRoom.[Room] as room,
   IHP_PromoRoom.[Date_Start] as date_start,
   IHP_PromoRoom.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
   end
   as date_time_start, IHP_PromoRoom.[Date_Finish] as date_finish, IHP_PromoRoom.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Ext.Start_Extend BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
) as wisa_waktu_promo_hari_ini_menit , IHP_PromoRoom.[Diskon_Persen] as diskon_persen, IHP_PromoRoom.[Diskon_Rp] as diskon_rp, IHP_PromoRoom.[Khusus] as khusus , 
   case
      when
         IHP_PromoRoom.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoRoom.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as keterangan_khusus, IHP_PromoRoom.[Status] as status_aktif, IHP_Ext.Start_Extend as checkin, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) as checkout, 
   case
      when
         IHP_Ext.Start_Extend between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            end
         )
      then
         1 
      when
         DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
      end
   )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) as different_time_Start_and_checkout, 
   case
      when
         (
            IHP_Ext.Start_Extend between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
      then
         DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
      when
         (
            IHP_Ext.Start_Extend between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            end
         )
) 
         when
            (
               DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                     else
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
      then
         CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
         )
, IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
         )
, IHP_Ext.Start_Extend), 114), 1, 12) 
      when
         IHP_Ext.Start_Extend between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
) 
         )
, IHP_Ext.Start_Extend), 114), 1, 12) 
         when
            DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         then
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               0 
            )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 114), 1, 12) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
         )
         and 
         (
            DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Ext.Start_Extend), 114), 1, 12) 
      when
         IHP_Ext.Start_Extend between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Ext.Start_Extend), 114), 1, 12) 
      when
         DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
         )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
         (
            - DATEDIFF(mi, 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
         )
, DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 114), 1, 12) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoRoom, IHP_Ext 
where
   (
      IHP_PromoRoom.Room = '[NONE]' 
      or IHP_PromoRoom.Room = '${jenis_kamar}' 
   )
   and 
   (
      IHP_PromoRoom.Hari = 0 
      or IHP_PromoRoom.Hari = 5 
   )
   and IHP_PromoRoom.Status = 1 
   and IHP_PromoRoom.Promo_Room = '${promo}' 
   and IHP_Ext.Reception = '${kode_rcp}'
   and IHP_Ext.Start_Extend = '${start_extned}'
   `;

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
                           " promo room start " + dataReturn.recordset[0].hasil_start_promo +
                           " promo room finish " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info(kode_rcp + " promo " + promo_ +
                           " promo room start " + dataReturn.recordset[0].hasil_start_promo +
                           " promo room finish " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log(kode_rcp + " promo " + promo_ + " Promo Room tidak Berlaku");
                        logger.info(kode_rcp + " promo " + promo_ + " Promo Room tidak Berlaku");
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

   getPromoExtendRoomOldTransferByRcpCheckOut(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               select
   IHP_PromoRoom.[Promo_Room] as promo_room,
   IHP_PromoRoom.[Hari] as hari,
   IHP_PromoRoom.[Room] as room,
   IHP_PromoRoom.[Date_Start] as date_start,
   IHP_PromoRoom.[Time_Start] as time_start,
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
   end
   as date_time_start, IHP_PromoRoom.[Date_Finish] as date_finish, IHP_PromoRoom.[Time_Finish] as time_finish, 
   case
      when
         CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
         and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
      then
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
   as date_time_finish , 
   case
      when
         IHP_Rcp.Checkout BETWEEN 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
         and 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
               and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      else
         DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
   end
) as wisa_waktu_promo_hari_ini_menit , IHP_PromoRoom.[Diskon_Persen] as diskon_persen, IHP_PromoRoom.[Diskon_Rp] as diskon_rp, IHP_PromoRoom.[Khusus] as khusus , 
   case
      when
         IHP_PromoRoom.[Khusus] = 0 
      then
         'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN' 
      when
         IHP_PromoRoom.[Khusus] = 1 
      then
         'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' 
   end
   as keterangan_khusus, IHP_PromoRoom.[Status] as status_aktif, IHP_Rcp.Checkout as checkin, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) as checkout, 
   case
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
      end
   )
) as different_checkin_and_finish_promo, DATEDIFF(mi, 
   (
      case
         when
            CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
            and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
         then
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         else
            DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
) 
               and 
               (
                  case
                     when
                        CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                        and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                     then
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                     else
                        DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkout), 114), 1, 12) 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               end
            )
) 
         )
, IHP_Rcp.Checkout), 114), 1, 12) 
         when
            DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 12) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            end
) 
            and 
            (
               case
                  when
                     CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                     and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                  then
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkout), 114), 1, 12) 
      when
         IHP_Rcp.Checkout between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
, IHP_Rcp.Checkout), 114), 1, 12) 
      when
         DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
         case
            when
               CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
            then
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
            else
               DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
         end
) 
         and 
         (
            case
               when
                  CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                  and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
               then
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
               else
                  DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                  else
                     DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
               end
            )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
         )
, DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 12) 
   end
   as hasil_start_promo 
FROM
   IHP_PromoRoom , IHP_Rcp 
where
   (
      IHP_PromoRoom.Room = '[NONE]' 
      or IHP_PromoRoom.Room = '${jenis_kamar}' 
   )
   and 
   (
      IHP_PromoRoom.Hari = 0 
      or IHP_PromoRoom.Hari = 5 
   )
   and IHP_PromoRoom.Status = 1 
   and IHP_PromoRoom.Promo_Room = '${promo}' 
   and IHP_Rcp.Reception =  '${kode_rcp}' `;

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
                        console.log("promo room " + promo_ +
                           " start " + dataReturn.recordset[0].hasil_start_promo +
                           " finish " + dataReturn.recordset[0].hasil_end_promo);

                        logger.info("promo room " + promo_ +
                           " start " + dataReturn.recordset[0].hasil_start_promo +
                           " finish " + dataReturn.recordset[0].hasil_end_promo);
                     }
                     else {
                        console.log("promo room " + promo_ + " Promo Room tidak Berlaku");
                        logger.info("promo room " + promo_ + " Promo Room tidak Berlaku");
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

   insertIhpDetailPromo(db_, kode_rcp_, kode_ivc_, nilai_promo_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var kode_ivc = kode_ivc_;
            var nilai_promo = nilai_promo_;
            var isiQuery = "" +
               " set dateformat dmy  " +
               " Delete From [dbo].[IHP_Detail_Promo] Where Reception='" + kode_rcp + "'" +
               " INSERT INTO [dbo].[IHP_Detail_Promo] " +
               "  ([Reception] " +
               "  ,[Invoice] " +
               "  ,[Nilai_Promo]) " +
               "  VALUES " +
               "  (" +
               "  '" + kode_rcp + "'" +
               "  ,'" + kode_ivc + "'" +
               "  ," + nilai_promo + "" +
               ") ";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  console.log(kode_rcp + " gagal insertIhpDetailPromo");
                  logger.info(kode_rcp + " gagal insertIhpDetailPromo");
                  resolve(false);
               } else {
                  sql.close();
                  console.log(kode_rcp + " Sukses insertIhpDetailPromo");
                  logger.info(kode_rcp + " Sukses insertIhpDetailPromo");
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

   getDeleteInsertIhpDetailDiskonSewaKamar(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `set
               dateformat dmy 
               delete
               from
                  [IHP_Detail_Diskon_Sewa_Kamar] 
               where
                  Reception = '${kode_rcp}' 
                  insert into
                     [IHP_Detail_Diskon_Sewa_Kamar] 
                     select
                        [IHP_Rcp].[Reception] as Reception,
                        [IHP_Rcp_DetailsRoom].[Nama_Kamar] as Kamar,
                        [IHP_Rcp_DetailsRoom].[Hari] as Hari,
                        [IHP_Rcp_DetailsRoom].[Overpax] as OverPax,
                        [IHP_Rcp_DetailsRoom].[Tarif] as Tarif,
                        [IHP_Rcp_DetailsRoom].[Date_Time_Start] as Date_Time_Start,
                        [IHP_Rcp_DetailsRoom].[Date_Time_Finish] as Date_Time_Finish,
                        case
                           when
                              --jika promo di separo awal checkin saja
                              [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                           when
                              --jika promo di separo akhir checkin saja
                              [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                           when
                              --jika promo di seluruh checkin checkout
                              [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                              and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                              )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                        end
                        as Hasil_Start_Promo , 
                        case
                           when
                              --jika promo di separo awal checkin saja
                              [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           when
                              --jika promo di separo akhir checkin saja
                              [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           when
                              --jika promo di seluruh checkin checkout
                              [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                              and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                           then
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        end
                        as Hasil_End_Promo , [IHP_Promo_Rcp].[Start_Promo], [IHP_Promo_Rcp].[End_promo], [IHP_Promo_Rcp].[Diskon_Persen], [IHP_Promo_Rcp].[Diskon_Rp], 
                        case
                           when
                              [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                              and [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                           then
                              60 
                           when
                              (
            ( 
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                              and 
                              (
            ( 
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                           then
                              DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
                           when
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
                              )
                              between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
                              DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
                              )
            , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
                           when
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                              between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
                              DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
            ) 
                           else
                              0 
                        end
                        as Menit_Yang_Digunakan , 
                        case
                           when
                              [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                              and [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                           then
            ([IHP_Rcp_DetailsRoom].[Tarif] / 100)*[IHP_Promo_Rcp].[Diskon_Persen] 
                           when
                              (
            ( 
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                              and 
                              (
            ( 
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                           then
            (([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) ) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
                           when
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
                              )
                              between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            (([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Rcp].[Checkout] ) 
                                       )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 end
                              )
            , [IHP_Rcp_DetailsRoom].[Time_Finish] )) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
                           when
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
                              between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            (([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
                              (
                                 case
                                    when
                                       --jika promo di separo awal checkin saja
                                       [IHP_Rcp].[Checkin] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di separo akhir checkin saja
                                       [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    when
                                       --jika promo di seluruh checkin checkout
                                       [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                       and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                                    then
                                       CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                       (
                                          DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                       )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 end
                              )
            )) / 100*[IHP_Promo_Rcp].[Diskon_Persen] 
                           else
                              0 
                        end
                        as Promo_Yang_Didapatkan 
                     from
                        [IHP_Rcp] 
                        INNER Join
                           [IHP_Promo_Rcp] 
                           on [IHP_Promo_Rcp].[Reception] = [IHP_Rcp].[Reception] 
                        INNER Join
                           [IHP_Rcp_DetailsRoom] 
                           on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
                     where
                        [IHP_Rcp].[Reception] = '${kode_rcp}' 
                        and [IHP_Promo_Rcp].[FlagExtend] = 0 
                        and [IHP_Promo_Rcp].[Status_Promo] = 1`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpDetailDiskonSewaKamar ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses getDeleteInsertIhpDetailDiskonSewaKamar ');
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

   getDeleteInsertIhpDetailDiskonSewaKamarExtend(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `
               set
               dateformat dmy 
                delete from [IHP_Detail_Diskon_Sewa_Kamar_Extend] where Reception = '${kode_rcp}'
              insert into [IHP_Detail_Diskon_Sewa_Kamar_Extend]
               select
            
                [IHP_Rcp].[Reception] as Reception,
                 [IHP_Rcp_DetailsRoom].[Nama_Kamar] as Kamar, 
                 [IHP_Rcp_DetailsRoom].[Hari] as Hari, 
                 [IHP_Rcp_DetailsRoom].[Overpax] as OverPax, 
                 [IHP_Rcp_DetailsRoom].[Tarif] as Tarif,
                 [IHP_Rcp_DetailsRoom].[Date_Time_Start] as Date_Time_Start,
                 [IHP_Rcp_DetailsRoom].[Date_Time_Finish] as Date_Time_Finish,
                 [IHP_Promo_Rcp].[Start_Promo],
                  [IHP_Promo_Rcp].[End_promo],
            
                 case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                        )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                        )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                  end
                  as Hasil_Start_Promo,
                 
                      case
                     when
                        --jika promo di separo awal checkin saja
                        [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di separo akhir checkin saja
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                     when
                        --jika promo di seluruh checkin checkout
                        [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                        )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                  end
                  as Hasil_End_Promo ,
            
                  [IHP_Promo_Rcp].[Diskon_Persen],
                  [IHP_Promo_Rcp].[Diskon_Rp],      
            
                 case
            
                 when
                        (
            ( ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] )
                        )
                        and 
                        (
            ( ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] )
                        )
                     then
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo])
            
                     when
                        (
                           [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              end
                           )
                        )
                        and 
                        (
                           [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              end
                           )
                        )
                     then
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo])            
            
                     when
                        (
            ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                        )
                     then
                        
            
                     DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
                  (
                     case
                        when
                           --jika promo di separo awal checkin saja
                           [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                        when
                           --jika promo di separo akhir checkin saja
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                        when
                           --jika promo di seluruh checkin checkout
                           [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     end
                  )
            )
            
            when
                        (
            ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                        )
                     then
                        DATEDIFF(mi, 
                  (
                     case
                        when
                           --jika promo di separo awal checkin saja
                           [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                        when
                           --jika promo di separo akhir checkin saja
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                           )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                        when
                           --jika promo di seluruh checkin checkout
                           [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                     end
                  )
            , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            
            
                  else
                        0 
                  end
                  as Menit_Yang_Digunakan, 
            
                 case
            
                 when
                        (
            ( ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] )
                        )
                        and 
                        (
            ( ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] )
                        )
                     then
                   (([IHP_Rcp_DetailsRoom].[Tarif] / 60) *
                        DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo])
               )/ 100*[IHP_Promo_Rcp].[Diskon_Persen]
            
            
               when
                        (
                           [IHP_Rcp_DetailsRoom].[Time_Start] between ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              end
                           )
                        )
                        and 
                        (
                           [IHP_Rcp_DetailsRoom].[Time_Finish] between ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) 
                           and 
                           (
                              case
                                 when
                                    --jika promo di separo awal checkin saja
                                    [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di separo akhir checkin saja
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                                 when
                                    --jika promo di seluruh checkin checkout
                                    [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                    and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 then
                                    CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              end
                           )
                        )
                     then
                        (([IHP_Rcp_DetailsRoom].[Tarif] / 60) *
                     DATEDIFF(mi, [IHP_Promo_Rcp].[Start_promo] , [IHP_Promo_Rcp].[End_promo])
                  )/ 100*[IHP_Promo_Rcp].[Diskon_Persen] 
            
                           when
                        (
            ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                        )
                     then
                        
            (([IHP_Rcp_DetailsRoom].[Tarif] / 60) *
                     DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], 
                  (
                     case
                        when
                           --jika promo di separo awal checkin saja
                           [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                        when
                           --jika promo di separo akhir checkin saja
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkout]), 114), 1, 12) 
                        when
                           --jika promo di seluruh checkin checkout
                           [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                     end
                  )
            )
            )/ 100*[IHP_Promo_Rcp].[Diskon_Persen] 
            
            when
                        (
            ( 
                           case
                              when
                                 --jika promo di separo awal checkin saja
                                 [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di separo akhir checkin saja
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                    (
                                       isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                    )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                                 )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                              when
                                 --jika promo di seluruh checkin checkout
                                 [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                                 and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                              then
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                                 )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                           end
            ) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                        )
                     then
                   
                   (([IHP_Rcp_DetailsRoom].[Tarif] / 60) *
                       DATEDIFF(mi, 
                  (
                     case
                        when
                           --jika promo di separo awal checkin saja
                           [IHP_Rcp].[Checkout] between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                        when
                           --jika promo di separo akhir checkin saja
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) between [IHP_Promo_Rcp].[Start_Promo] and [IHP_Promo_Rcp].[End_promo] 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                           )
            , [IHP_Promo_Rcp].[End_promo] ), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) ) 
                           )
            , [IHP_Promo_Rcp].[End_promo]), 114), 1, 12) 
                        when
                           --jika promo di seluruh checkin checkout
                           [IHP_Promo_Rcp].[Start_Promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                           and [IHP_Promo_Rcp].[End_promo] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12) 
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              - DATEDIFF(mi, [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] ) 
                           )
            , CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                           )
            , [IHP_Rcp].[Checkin]), 114), 1, 12)), 114), 1, 12) 
                     end
                  )
            , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
            
            )/ 100*[IHP_Promo_Rcp].[Diskon_Persen] 
            
                 else
                        0 
                  end
                  as Promo_Yang_Didapatkan
            
            
               from
                  [IHP_Rcp] 
                  left Join
                     [IHP_Ext] 
                     on [IHP_Rcp].[Reception] = [IHP_Ext].[Reception] 
                  INNER Join
                     [IHP_Promo_Rcp] 
                     on [IHP_Promo_Rcp].[Reception] = [IHP_Rcp].[Reception] 
                  INNER Join
                     [IHP_Rcp_DetailsRoom] 
                     on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
               where
                [IHP_Rcp].[Reception] = '${kode_rcp}'
                
                  and [IHP_Promo_Rcp].[FlagExtend] = 1 
                  and [IHP_Promo_Rcp].[Status_Promo] = 1 
               Group By
                  [IHP_Rcp].[Reception], [IHP_Rcp].[Checkin], [IHP_Rcp].[Jam_Sewa], [IHP_Rcp].[Menit_Sewa], [IHP_Rcp].[Checkout] , [IHP_Promo_Rcp].[Promo] , [IHP_Promo_Rcp].[Start_Promo] , [IHP_Promo_Rcp].[End_promo] , [IHP_Promo_Rcp].[Diskon_Persen] , [IHP_Promo_Rcp].[Diskon_Rp] , [IHP_Rcp_DetailsRoom].[Overpax] , [IHP_Rcp_DetailsRoom].[Tarif] , [IHP_Rcp_DetailsRoom].[Time_Start] , [IHP_Rcp_DetailsRoom].[Time_Finish],[IHP_Rcp_DetailsRoom].[Nama_Kamar],[IHP_Rcp_DetailsRoom].[Hari],[IHP_Rcp_DetailsRoom].[Date_Time_Start],[IHP_Rcp_DetailsRoom].[Date_Time_Finish]
                  `;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpDetailDiskonSewaKamarExtend ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses getDeleteInsertIhpDetailDiskonSewaKamarExtend ');
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

   getDeleteInsertIhpPromoRcpRoomByRcpCheckin(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_, flag_extend_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var kode_rcp = kode_rcp_;
            var flag_extend = flag_extend_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               ` delete
               from
                  [IHP_Promo_Rcp] 
               where
                  Reception = '${kode_rcp}' 
                  and [FlagExtend] = 0
                  and [Status_Promo] = 1
                  insert into
                     [IHP_Promo_Rcp] 
                     select
                        '${kode_rcp}' AS Reception,
                        IHP_PromoRoom.[Promo_Room] as Promo,
            
                     CONVERT(DATETIME,
                     case
                           when
                              (
                                 IHP_Rcp.Checkin between ( 
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 end
            ) 
                                 and 
                                 (
                                    case
                                       when
                                          CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                          and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                       then
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 end
            ) 
                                 and 
                                 (
                                    case
                                       when
                                          CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                          and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                       then
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            , IHP_Rcp.Checkin), 114), 1, 12) 
                           when
                              IHP_Rcp.Checkin between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            , IHP_Rcp.Checkin), 114), 1, 12) 
                           when
                              DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                          DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                                          DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    end
                                 )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)) 
                              )
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 12) 
                        end
                     ,103)
                        as Start_Promo,
            
                     CONVERT(DATETIME,
            
                     case
                           when
                              (
                                 IHP_Rcp.Checkin between ( 
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 end
            ) 
                                 and 
                                 (
                                    case
                                       when
                                          CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                          and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                       then
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 end
            ) 
                                 and 
                                 (
                                    case
                                       when
                                          CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                          and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                       then
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            , IHP_Rcp.Checkin), 114), 1, 12) 
                           when
                              IHP_Rcp.Checkin between ( 
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
            ) 
                              and 
                              (
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                       and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                    end
                                 )
            ) 
                              )
            , IHP_Rcp.Checkin), 114), 1, 12) 
                              when
                                 DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin) between ( 
                                 case
                                    when
                                       CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                    then
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                    else
                                       DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 end
            ) 
                                 and 
                                 (
                                    case
                                       when
                                          CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) >= 0 
                                          and CAST(substring(convert(varchar(24), IHP_Rcp.Checkin, 114), 1, 2)AS int) <= 5 
                                       then
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkin), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                       else
                                          DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkin, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
            , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkin)), 114), 1, 12) 
                        end
                     ,103)
                        as End_Promo,                     
                         
                        
                     1 as Status_Promo, 0 Syarat_Kamar, IHP_PromoRoom.[Room] as Kamar, 0 Syarat_Jenis_kamar, '[NONE]' as Jenis_Kamar, 0 as Syarat_Durasi, 0 as Durasi, 0 as Syarat_Hari, IHP_PromoRoom.[Hari] as hari, 0 as Syarat_Jam, IHP_PromoRoom.[Date_Start] as Date_Start, IHP_PromoRoom.[Time_Start] as Time_Start, IHP_PromoRoom.[Date_Finish] as Date_Finish, IHP_PromoRoom.[Time_Finish] as Time_Finish, 0 Syarat_Quantity, 0 Quantity, IHP_PromoRoom.[Diskon_Persen] as Diskon_Persen, IHP_PromoRoom.[Diskon_Rp] as Diskon_Rp, 0 Syarat_Inventory, '' as Inventory, 0 as Sign_Inventory, 0 as Sign_Diskon_Persen, 0 as Sign_Diskon_Rp, 
                     0 as FlagExtend 
                     FROM
                        IHP_PromoRoom , IHP_Rcp 
                     where
                        (
                           IHP_PromoRoom.Room = '[NONE]' 
                           or IHP_PromoRoom.Room = '${jenis_kamar}' 
                        )
                        and 
                        (
                           IHP_PromoRoom.Hari = 0 
                           or IHP_PromoRoom.Hari = 5 
                        )
                        and IHP_PromoRoom.Status = 1 
                        and IHP_PromoRoom.Promo_Room = '${promo}' 
                        and IHP_Rcp.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpRoomByRcpCheckin ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();

                  logger.info(kode_rcp + ' Sukses getDeleteInsertIhpPromoRcpRoomByRcpCheckin');
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

   getInsertIhpPromoRcpRoomByJamCheckoutIhpRoom(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
            insert into
            [IHP_Promo_Rcp] 
            select
               '${kode_rcp}' AS Reception,
               IHP_PromoRoom.[Promo_Room] as Promo,
               CONVERT(DATETIME, 
               case
                  when
                     (
                        IHP_Room.Jam_Checkout between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Room.Jam_Checkout), 114), 1, 12) 
                  when
                     IHP_Room.Jam_Checkout between ( 
                     case
                        when
                           CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                        then
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        else
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                     end
      ) 
                     and 
                     (
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                              and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Room.Jam_Checkout), 114), 1, 12) 
                  when
                     DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
                     case
                        when
                           CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                        then
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        else
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                     end
      ) 
                     and 
                     (
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                              and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
                        )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)) 
                     )
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 12) 
               end
      , 103) as Start_Promo, CONVERT(DATETIME, 
               case
                  when
                     (
                        IHP_Room.Jam_Checkout between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Room.Jam_Checkout), 114), 1, 12) 
                  when
                     IHP_Room.Jam_Checkout between ( 
                     case
                        when
                           CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                        then
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        else
                           DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                     end
      ) 
                     and 
                     (
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                              and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                           end
                        )
      ) 
                     )
      , IHP_Room.Jam_Checkout), 114), 1, 12) 
                     when
                        DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout) between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Room.Jam_Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Room.Jam_Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Room.Jam_Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , DATEADD(minute, ${durasi_menit}, IHP_Room.Jam_Checkout)), 114), 1, 12) 
               end
      , 103) as End_Promo, 1 as Status_Promo, 0 Syarat_Kamar, IHP_PromoRoom.[Room] as Kamar, 0 Syarat_Jenis_kamar, '[NONE]' as Jenis_Kamar, 0 as Syarat_Durasi, 0 as Durasi, 0 as Syarat_Hari, IHP_PromoRoom.[Hari] as hari, 0 as Syarat_Jam, IHP_PromoRoom.[Date_Start] as Date_Start, IHP_PromoRoom.[Time_Start] as Time_Start, IHP_PromoRoom.[Date_Finish] as Date_Finish, IHP_PromoRoom.[Time_Finish] as Time_Finish, 0 Syarat_Quantity, 0 Quantity, IHP_PromoRoom.[Diskon_Persen] as Diskon_Persen, IHP_PromoRoom.[Diskon_Rp] as Diskon_Rp, 0 Syarat_Inventory, '' as Inventory, 0 as Sign_Inventory, 0 as Sign_Diskon_Persen, 0 as Sign_Diskon_Rp, 1 as FlagExtend 
            FROM
               IHP_PromoRoom , IHP_Rcp , IHP_Room 
            where
               (
                  IHP_PromoRoom.Room = '[NONE]' 
                  or IHP_PromoRoom.Room = '${jenis_kamar}' 
               )
               and 
               (
                  IHP_PromoRoom.Hari = 0 
                  or IHP_PromoRoom.Hari = 5 
               )
               and IHP_PromoRoom.Status = 1 
               and IHP_PromoRoom.Promo_Room = '${promo}' 
               and IHP_Rcp.Reception = '${kode_rcp}' 
               and IHP_Room.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpRoomByJamCheckoutIhpRoom ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses prosesQuery getDeleteInsertIhpPromoRcpRoomByJamCheckoutIhpRoom ');
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

   getInsertIhpPromoRcpRoomByStartExtendIhpExt(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_, start_extend_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            var start_extend = start_extend_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               insert into
               [IHP_Promo_Rcp] 
               select
                  '${kode_rcp}' AS Reception,
                  IHP_PromoRoom.[Promo_Room] as Promo,
                  CONVERT(DATETIME, 
                  case
                     when
                        (
                           IHP_Ext.Start_Extend between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
         ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
                        )
                        and 
                        (
                           DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
         ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         , IHP_Ext.Start_Extend), 114), 1, 12) 
                     when
                        IHP_Ext.Start_Extend between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
         ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
         , IHP_Ext.Start_Extend), 114), 1, 12) 
                     when
                        DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
         ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
                           )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
                        )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           - DATEDIFF(mi, 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
                           )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
                        )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 114), 1, 12) 
                  end
         , 103) as Start_Promo, CONVERT(DATETIME, 
                  case
                     when
                        (
                           IHP_Ext.Start_Extend between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
         ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
                        )
                        and 
                        (
                           DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
         ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
                        )
                     then
                        CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
                        )
         , IHP_Ext.Start_Extend), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                        (
                           DATEDIFF(mi, IHP_Ext.Start_Extend , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)) 
                        )
         , IHP_Ext.Start_Extend), 114), 1, 12) 
                     when
                        IHP_Ext.Start_Extend between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
         ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
         ) 
                        )
         , IHP_Ext.Start_Extend), 114), 1, 12) 
                        when
                           DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
         ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Ext.Start_Extend, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Ext.Start_Extend), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Ext.Start_Extend, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
                        then
                           CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                           (
                              0 
                           )
         , DATEADD(minute,${durasi_menit}, IHP_Ext.Start_Extend)), 114), 1, 12) 
                  end
         , 103) as End_Promo, 1 as Status_Promo, 0 Syarat_Kamar, IHP_PromoRoom.[Room] as Kamar, 0 Syarat_Jenis_kamar, '[NONE]' as Jenis_Kamar, 0 as Syarat_Durasi, 0 as Durasi, 0 as Syarat_Hari, IHP_PromoRoom.[Hari] as hari, 0 as Syarat_Jam, IHP_PromoRoom.[Date_Start] as Date_Start, IHP_PromoRoom.[Time_Start] as Time_Start, IHP_PromoRoom.[Date_Finish] as Date_Finish, IHP_PromoRoom.[Time_Finish] as Time_Finish, 0 Syarat_Quantity, 0 Quantity, IHP_PromoRoom.[Diskon_Persen] as Diskon_Persen, IHP_PromoRoom.[Diskon_Rp] as Diskon_Rp, 0 Syarat_Inventory, '' as Inventory, 0 as Sign_Inventory, 0 as Sign_Diskon_Persen, 0 as Sign_Diskon_Rp, 1 as FlagExtend 
               FROM
                  IHP_PromoRoom , IHP_Rcp , IHP_Room ,IHP_Ext 
               where
                  (
                     IHP_PromoRoom.Room = '[NONE]' 
                     or IHP_PromoRoom.Room = '${jenis_kamar}' 
                  )
                  and 
                  (
                     IHP_PromoRoom.Hari = 0 
                     or IHP_PromoRoom.Hari = 5 
                  )
                  and IHP_PromoRoom.Status = 1 
                  and IHP_PromoRoom.Promo_Room = '${promo}' 
                  and IHP_Rcp.Reception = '${kode_rcp}' 
                  and IHP_Room.Reception = '${kode_rcp}'
                  and IHP_Ext.Reception = '${kode_rcp}'
                  and IHP_Ext.Start_Extend = '${start_extend}'
                  `;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getInsertIhpPromoRcpRoomByStartExtendIhpExt ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' Sukses prosesQuery getInsertIhpPromoRcpRoomByStartExtendIhpExt ');
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

   getDeleteInsertIhpPromoRcpRoomExtendOldTransferByRcpCheckOut(db_, promo_, durasi_menit_, jenis_kamar_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var promo = promo_;
            var durasi_menit__ = durasi_menit_;
            var durasi_menit = parseInt(durasi_menit__);
            var jenis_kamar = jenis_kamar_;
            //warning do Not use set dateformat dmy
            var isiQuery = "" +
               `
               insert into
               [IHP_Promo_Rcp] 
               select
                  '${kode_rcp}' AS Reception,
                  IHP_PromoRoom.[Promo_Room] as Promo,
      
               CONVERT(DATETIME,
               case
                     when
                        (
                           IHP_Rcp.Checkout between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
      ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
      ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Rcp.Checkout), 114), 1, 12) 
                     when
                        IHP_Rcp.Checkout between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Rcp.Checkout), 114), 1, 12) 
                     when
                        DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              end
                           )
      , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)) 
                        )
      , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 12) 
                  end
               ,103)
                  as Start_Promo,
      
               CONVERT(DATETIME,
      
               case
                     when
                        (
                           IHP_Rcp.Checkout between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
      ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
      ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , IHP_Rcp.Checkout), 114), 1, 12) 
                     when
                        IHP_Rcp.Checkout between ( 
                        case
                           when
                              CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                           then
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           else
                              DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                        end
      ) 
                        and 
                        (
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                              end
                           )
      ) 
                        )
      , IHP_Rcp.Checkout), 114), 1, 12) 
                        when
                           DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout) between ( 
                           case
                              when
                                 CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                              then
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                              else
                                 DATEADD(day, IHP_PromoRoom.[Date_Start], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Start])) 
                           end
      ) 
                           and 
                           (
                              case
                                 when
                                    CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) >= 0 
                                    and CAST(substring(convert(varchar(24), IHP_Rcp.Checkout, 114), 1, 2)AS int) <= 5 
                                 then
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, IHP_Rcp.Checkout), 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
                                 else
                                    DATEADD(day, IHP_PromoRoom.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), IHP_Rcp.Checkout, 23) + ' ' + IHP_PromoRoom.[Time_Finish])) 
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
      , DATEADD(minute, ${durasi_menit}, IHP_Rcp.Checkout)), 114), 1, 12) 
                  end
               ,103)
                  as End_Promo,               
                   
                  
               1 as Status_Promo, 0 Syarat_Kamar, IHP_PromoRoom.[Room] as Kamar, 0 Syarat_Jenis_kamar, '[NONE]' as Jenis_Kamar, 0 as Syarat_Durasi, 0 as Durasi, 0 as Syarat_Hari, IHP_PromoRoom.[Hari] as hari, 0 as Syarat_Jam, IHP_PromoRoom.[Date_Start] as Date_Start, IHP_PromoRoom.[Time_Start] as Time_Start, IHP_PromoRoom.[Date_Finish] as Date_Finish, IHP_PromoRoom.[Time_Finish] as Time_Finish, 0 Syarat_Quantity, 0 Quantity, IHP_PromoRoom.[Diskon_Persen] as Diskon_Persen, IHP_PromoRoom.[Diskon_Rp] as Diskon_Rp, 0 Syarat_Inventory, '' as Inventory, 0 as Sign_Inventory, 0 as Sign_Diskon_Persen, 0 as Sign_Diskon_Rp, 1 as FlagExtend 
               FROM
                  IHP_PromoRoom , IHP_Rcp 
               where
                  (
                     IHP_PromoRoom.Room = '[NONE]' 
                     or IHP_PromoRoom.Room = '${jenis_kamar}' 
                  )
                  and 
                  (
                     IHP_PromoRoom.Hari = 0 
                     or IHP_PromoRoom.Hari = 5 
                  )
                  and IHP_PromoRoom.Status = 1 
                  and IHP_PromoRoom.Promo_Room = '${promo}' 
                  and IHP_Rcp.Reception = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery getDeleteInsertIhpPromoRcpRoomExtendOldTransferByRcpCheckOut ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  logger.info(kode_rcp + ' sukses prosesQuery getDeleteInsertIhpPromoRcpRoomExtendOldTransferByRcpCheckOut ');
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

   getPromoRcpRoom(db_, kode_rcp_, flag_extend_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var flag_extend = flag_extend_;
            var isiQuery = "" +
               `select distinct Promo as promo from IHP_Promo_Rcp where Reception='${kode_rcp}' 
            and FlagExtend=${flag_extend} 
            and Status_Promo=1`;

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


}
module.exports = PromoRoom;