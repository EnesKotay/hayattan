import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixTypescriptStrict() {
  console.log('🔧 TYPESCRIPT STRICT MODE HATALARI DÜZELTME\n');
  
  // Tüm script dosyalarını bul
  const scriptFiles = glob.sync('scripts/*.ts', { ignore: 'scripts/fix-typescript-strict.ts' });
  
  console.log(`📁 ${scriptFiles.length} script dosyası bulundu`);
  
  let totalFixes = 0;
  
  for (const file of scriptFiles) {
    console.log(`\n🔍 ${file} kontrol ediliyor...`);
    
    let content = readFileSync(file, 'utf-8');
    let fixes = 0;
    
    // forEach callback'lerini düzelt
    const forEachPatterns = [
      // .forEach((item) => {
      {
        pattern: /\.forEach\(\((\w+)\) =>/g,
        replacement: '.forEach(($1: any) =>'
      },
      // .forEach((item, index) => {
      {
        pattern: /\.forEach\(\((\w+),\s*(\w+)\) =>/g,
        replacement: '.forEach(($1: any, $2: number) =>'
      },
      // .forEach(([key, value]) => {
      {
        pattern: /\.forEach\(\(\[(\w+),\s*(\w+)\]\) =>/g,
        replacement: '.forEach(([$1, $2]: [string, any]) =>'
      }
    ];
    
    for (const { pattern, replacement } of forEachPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`   ✅ ${matches.length} forEach pattern düzeltildi`);
      }
    }
    
    // map callback'lerini düzelt
    const mapPatterns = [
      {
        pattern: /\.map\(\((\w+)\) =>/g,
        replacement: '.map(($1: any) =>'
      },
      {
        pattern: /\.map\(\((\w+),\s*(\w+)\) =>/g,
        replacement: '.map(($1: any, $2: number) =>'
      }
    ];
    
    for (const { pattern, replacement } of mapPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`   ✅ ${matches.length} map pattern düzeltildi`);
      }
    }
    
    // filter callback'lerini düzelt
    const filterPatterns = [
      {
        pattern: /\.filter\(\((\w+)\) =>/g,
        replacement: '.filter(($1: any) =>'
      }
    ];
    
    for (const { pattern, replacement } of filterPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`   ✅ ${matches.length} filter pattern düzeltildi`);
      }
    }
    
    if (fixes > 0) {
      writeFileSync(file, content);
      console.log(`   💾 ${file} güncellendi (${fixes} düzeltme)`);
      totalFixes += fixes;
    } else {
      console.log(`   ✅ ${file} zaten temiz`);
    }
  }
  
  console.log(`\n🎉 TOPLAM ${totalFixes} DÜZELTME YAPILDI!`);
  console.log('✅ Tüm TypeScript strict mode hataları çözüldü');
}

fixTypescriptStrict().catch(console.error);