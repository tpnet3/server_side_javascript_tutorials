var a = ['f', 'ztta', 'c', 'de', 'kor'];
function compare(a, b){
  return b.length - a.length;
}
var result = a.sort(compare);
console.log(result);
