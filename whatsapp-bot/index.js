const venom = require('venom-bot');
const axios = require('axios');

// API'den döviz ve altın verilerini almak için fonksiyon
async function getFinancialData() {
  const apiUrl = 'https://finans.truncgil.com/v4/today.json';

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (response.status === 200) {
      return response.data; // Finans verilerini döndür
    } else {
      throw new Error(`API erişim hatası: ${response.status}`);
    }
  } catch (error) {
    console.error('Finans verisi alınamadı:', error.message);
    return null;
  }
}

// WhatsApp botunu başlat
venom
  .create({
    session: 'whatsapp-session', // Oturum adı
    multidevice: true, // Çoklu cihaz desteği
    folderNameToken: 'tokens', // Tokenlerin kaydedileceği klasör
    headless: 'new', // Yeni headless modunu kullan
  })
  .then((client) => {
    startBot(client);  // Botu başlat
    scheduleHourlyUpdates(client);  // Saatlik güncellemeleri planla
  })
  .catch((error) => console.log('Bot başlatılamadı:', error));

// Botun ana işlevi
async function startBot(client) {
  console.log('Bot hazır ve çalışıyor!');

  // Komutlara yanıt verme
  client.onMessage(async (message) => {
    if (message.body === '%altın') {
      // Finans verilerini al
      const financialData = await getFinancialData();
      if (financialData) {
        // Altın verilerini al
        const gramAltin = financialData?.GRA || {};
        const ceyrekAltin = financialData?.CEY || {};
        const yarimAltin = financialData?.YAR || {};
        const tamAltin = financialData?.TAM || {};
        const ayar22Altin = financialData?.YIA || {};
        const gumGumus = financialData?.GUM || {};

        const messageContent = `
          💰 *Altın Fiyatları:*

            ●› *22 Ayar Altın:* 
            ›› Alış: ${ayar22Altin?.Buying || 'Veri yok'}
            ›› Satış: ${ayar22Altin?.Selling || 'Veri yok'}

            ●› *Gram Altın:* 
            ›› Alış: ${gramAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${gramAltin?.Selling || 'Veri yok'}

            ●› *Çeyrek Altın:* 
            ›› Alış: ${ceyrekAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${ceyrekAltin?.Selling || 'Veri yok'}

            ●› *Yarım Altın:* 
            ›› Alış: ${yarimAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${yarimAltin?.Selling || 'Veri yok'}

            ●› *Tam Altın:* 
            ›› Alış: ${tamAltin?.Buying || 'Veri yok'}
            ›› Satış: ${tamAltin?.Selling || 'Veri yok'}
            
            ●› *Gümüş* 
            ›› Alış: ${gumGumus?.Buying || 'Veri yok'}
            ›› Satış: ${gumGumus?.Selling || 'Veri yok'}    
        `;
        client.sendText(message.from, messageContent);  // Kullanıcıya altın fiyatlarını gönder
      } else {
        client.sendText(message.from, 'Finans verileri alınamadığı için mesaj gönderilemedi.');
      }
    }
  });
}

// Saatlik güncellemeleri planla
function scheduleHourlyUpdates(client) {
  setInterval(async () => {
    // Finans verilerini al
    const financialData = await getFinancialData();

    if (financialData) {
      // Altın verilerini al
      const gramAltin = financialData?.GRA || {};
      const ceyrekAltin = financialData?.CEY || {};
      const yarimAltin = financialData?.YAR || {};
      const tamAltin = financialData?.TAM || {};
      const ayar22Altin = financialData?.YIA || {};
      const gumGumus = financialData?.GUM || {};

      // WhatsApp mesajını oluştur
      const message = `
      💰 *Altın Fiyatları:*

            ●› *22 Ayar Altın:* 
            ›› Alış: ${ayar22Altin?.Buying || 'Veri yok'}
            ›› Satış: ${ayar22Altin?.Selling || 'Veri yok'}

            ●› *Gram Altın:* 
            ›› Alış: ${gramAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${gramAltin?.Selling || 'Veri yok'}

            ●› *Çeyrek Altın:* 
            ›› Alış: ${ceyrekAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${ceyrekAltin?.Selling || 'Veri yok'}

            ●› *Yarım Altın:* 
            ›› Alış: ${yarimAltin?.Buying || 'Veri yok'} 
            ›› Satış: ${yarimAltin?.Selling || 'Veri yok'}

            ●› *Tam Altın:* 
            ›› Alış: ${tamAltin?.Buying || 'Veri yok'}
            ›› Satış: ${tamAltin?.Selling || 'Veri yok'}
            
            ●› *Gümüş* 
            ›› Alış: ${gumGumus?.Buying || 'Veri yok'}
            ›› Satış: ${gumGumus?.Selling || 'Veri yok'}  
      
    `;

      const phoneNumber = '(TELEFON NUMARASI BURAYA | 905123456789 ŞEKLİNDE)@c.us'; // WhatsApp numarası (ülke kodu dahil)

      // WhatsApp mesajını gönder
      client
        .sendText(phoneNumber, message)
        .then(() => console.log('Saatlik finans bilgileri WhatsApp üzerinden gönderildi!'))
        .catch((error) =>
          console.error('Mesaj gönderilirken hata oluştu:', error.message)
        );
    } else {
      console.log('Finans verileri alınamadığı için saatlik mesaj gönderilmedi.');
    }
  }, 3600000);  // 1 saat = 3600000 ms
}
