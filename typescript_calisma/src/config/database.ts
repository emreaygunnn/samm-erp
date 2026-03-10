import { oracleConfig } from "./config.ts"; //oracle buraya çek

// Oracle veritabanına bağlanmak için gerekli olan modülü içe aktar
export async function connectToOracle() {
  console.log("--------------------");
  console.log(
    `'${oracleConfig.user} kullanıcısı ile Oracle veritabanına bağlanılıyor...'`,
  );

  //zamanaşımı
  await new Promise((resolve) => setTimeout(resolve, 2000)); //2 saniye bekle
  // normalde burada oracle veritabanına bağlanma kodları olur

  const connectionSuccess = true; //bağlantının başarılı olduğunu varsayıyoruz

  if (connectionSuccess) {
    console.log("Oracle veritabanına başarıyla bağlanıldı!");
    return true;
  } else {
    throw new Error("Oracle veritabanına bağlanırken bir hata oluştu!");
  }
}
