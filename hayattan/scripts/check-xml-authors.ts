import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

function extractText(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (Array.isArray(item) && item.length > 0) return extractText(item[0]);
  if (item._) return item._;
  return '';
}

async function checkXMLAuthors() {
  try {
    console.log('🔍 XML\'DEKİ YAZAR BİLGİLERİNİ KONTROL EDİYORUZ...\n');
    
    const xmlPath = 'C:\\Users\\Enes Can Kotay\\Downloads\\hayattannet.WordPress.2026-02-10.xml';
    const xmlContent = readFileSync(xmlPath, 'utf-8');
    
    console.log('🔍 XML parse ediliyor...');
    const result = await parseXML(xmlContent) as any;
    const channel = result.rss.channel[0];
    
    // XML'deki yazarları listele
    console.log('👤 XML\'DEKİ YAZARLAR:');
    const authors = channel['wp:author'] || [];
    
    authors.forEach((author: any, index: number) => {
      const authorId = extractText(author['wp:author_id']);
      const login = extractText(author['wp:author_login']);
      const email = extractText(author['wp:author_email']);
      const displayName = extractText(author['wp:author_display_name']);
      const firstName = extractText(author['wp:author_first_name']);
      const lastName = extractText(author['wp:author_last_name']);
      
      console.log(`   ${index + 1}. ID: ${authorId}`);
      console.log(`      Login: ${login}`);
      console.log(`      Email: ${email}`);
      console.log(`      Display Name: ${displayName}`);
      console.log(`      First Name: ${firstName}`);
      console.log(`      Last Name: ${lastName}`);
      console.log('');
    });
    
    // İlk birkaç yazıdaki dc:creator'ları kontrol et
    console.log('📝 İLK 20 YAZIDAKI YAZAR BİLGİLERİ:');
    const items = channel.item || [];
    
    const creatorCounts = new Map();
    
    items.slice(0, 20).forEach((item: any, index: number) => {
      const title = extractText(item.title);
      const creator = extractText(item['dc:creator']);
      const postType = extractText(item['wp:post_type']);
      const postStatus = extractText(item['wp:status']);
      
      if (postType === 'post' && postStatus === 'publish') {
        console.log(`   ${index + 1}. "${title.substring(0, 50)}..." → Yazar: "${creator}"`);
        creatorCounts.set(creator, (creatorCounts.get(creator) || 0) + 1);
      }
    });
    
    console.log('\n📊 TÜM YAZILARDAKI YAZAR DAĞILIMI:');
    const allCreators = new Map();
    
    items.forEach((item: any) => {
      const creator = extractText(item['dc:creator']);
      const postType = extractText(item['wp:post_type']);
      const postStatus = extractText(item['wp:status']);
      
      if (postType === 'post' && postStatus === 'publish' && creator) {
        allCreators.set(creator, (allCreators.get(creator) || 0) + 1);
      }
    });
    
    Array.from(allCreators.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([creator, count]: [string, number]) => {
        console.log(`   "${creator}": ${count} yazı`);
      });
    
    console.log('\n💡 SORUN TESPİTİ:');
    console.log('XML\'deki dc:creator isimleri ile wp:author display_name\'leri karşılaştırılmalı.');
    console.log('Muhtemelen yazar eşleştirme algoritması yanlış çalışıyor.');
    
  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  }
}

checkXMLAuthors();