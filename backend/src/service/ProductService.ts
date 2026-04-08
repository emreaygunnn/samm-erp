    import oracledb from "oracledb";
    import { oracleConfig } from "../config/config.js";
    import type { UpdateResult } from "@shared/types/product.ts";

    // oracle tablo adları
    const TABLE_NAME = "PRODUCTS";
    const COLUMNS = {
        id: "ID",
        stock: "STOCK",
        location: "LOCATION",
    }

    // FRONTEND DEN GELEN ALAN ADI  ORACLE TABLO ALAN ADI EŞLEŞMESİ
    // Sadece izin verilen alanlar ö
    const ALLOWED_COLUMNS: Record<string, string> = {
        stock: COLUMNS.stock,
        location: COLUMNS.location,

    }

    // güncelleme sonucu değerler



    //PRODUCT SERVICE

    export class ProductService {
        // ── Oracle bağlantısı aç ──────────────────────────────────────
        // Her işlemde bağlantı açılır, iş bitince kapatılır.
        private async getConnection() {
            return await oracledb.getConnection(oracleConfig);
        }


        // ── Tek ürün güncelle (stok veya lokasyon) ────────────────────
        // UPDATE PRODUCTS SET STOCK = :stok WHERE ITEM_CODE = :id

        public async updateProduct(id: string, fields: Record<string, any>): Promise<UpdateResult> {
            const setClauses: string[] = []; // boş array oluşturduk --  sql in SET kısmının parçalarını toplayacak
            const bind: Record<string, any> = { id }; // oracle gönderilecek değerler -- id parametresi


            // frontend den gelen alanları oracle sütunlarına çevirme

            for (const [field, value] of Object.entries(fields)) { // entries ile key value çiftlerini alırız
                const column = ALLOWED_COLUMNS[field];// frontend deki alanın oracle karşılığını bul
                if (!column) continue; // izin verilmeyen alanları atla

                setClauses.push(`${column} = :${field}`);
                bind[field] = value;

            }
            if (setClauses.length === 0) {
                throw new Error("Güncellenecek alan bulunamadı");
            }

            const sql = `UPDATE ${TABLE_NAME} SET ${setClauses.join(",")} WHERE ${COLUMNS.id} = :id`;

            const connection = await this.getConnection();
            try {
                const result = await connection.execute(sql, bind, { autoCommit: true });

                if (result.rowsAffected === 0) {
                    throw new Error(`"${id}"kodlu ürün Oracle da bulunamadı`);

                }



                return {
                    id,
                    success: true,
                    message: `${id} başarıyla güncellendi`,
                };
            } finally {
                await connection.close();
            }


        }
        // toplu güncelleme

        public async bulkUpdate(items: Array<{ id: string;[key: string]: any }>): Promise<UpdateResult[]> {//Array<{ id: string; [key: string]: any }> → "Her elemanında id olan bir dizi" demek. [key: string]: any ise "id dışında başka alanlar da olabilir, ne gelirse gelsin" diyor.
            //Promise<UpdateResult[]> → Her ürün için bir sonuç döner:


            const results: UpdateResult[] = []; // her ürünün sonucunu buraya toplayacağız
            for (const item of items) { // dizideki her ürünü tek tek al
                const { id, ...fields } = item; // id yi ayır kalanını fields e at

                try {
                    const result = await this.updateProduct(id, fields);// tekli güncelleme metodunu çağır zaten oracle bağlantısını o hallediyor
                    results.push(result); // sonucu results arrayine ekle
                }
                catch (err) {
                    results.push({
                        id,
                        success: false,
                        message: (err as Error).message,
                    });
                }
            }
            return results;
        }




    }