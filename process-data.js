const csvFilePath = './resources/taxonomy.csv'
const csv = require('csvtojson')
const fs = require('fs')

var taxonomy = {}
var currentPath = []
var currentLevel = 0
var previousTaxon = ''

var addTaxon = function addTaxon(taxon, taxonomy, path){
  // console.log(`addTaxon(${JSON.stringify(taxon)},${JSON.stringify(path)})`)
  var parent = taxonomy
  for (var i=0;i<path.length;i++){
    parent = parent[path[i]]
  }
  parent[taxon] = {}
}

csv({noheader:true})
.fromFile(csvFilePath)
.on('csv',(csvRow)=>{
    // console.dir(csvRow)
    for (var i=0; i<csvRow.length; i++){
      if (csvRow[i] !== ''){
        var taxon = csvRow[i]
        // console.log('taxon: ' + taxon)
        if (i == currentLevel){
          // console.log('same level')
          // use current path
          addTaxon(taxon, taxonomy, currentPath)
        }
        else if (i == currentLevel+1){
          // console.log('child of previous')
          // console.log('previousTaxon: ' + previousTaxon)
          // child of previous taxon
          currentPath.push(previousTaxon)
          addTaxon(taxon, taxonomy, currentPath)
        }
        else if (i < currentLevel) {
          // console.log('going up some levels')
          // update currentPath
          var difference = currentLevel - i
          currentPath.splice(currentPath.length - difference, difference);
          addTaxon(taxon, taxonomy, currentPath)
        }
        else {
          console.log('uncaught condition')
        }
        currentLevel = i
        break
      }
    }
    previousTaxon = taxon
    // console.log()
})
.on('done',(error)=>{
  if (taxonomy['Home']){
    // remove treejack 'home' level
    taxonomy = taxonomy['Home']
  }

  function sortHash(old){
    var newo = {}
    Object.keys(old).sort().forEach(function(k){
      newo[k]=sortHash(old[k])
    })
    return newo
  }

  taxonomy = sortHash(taxonomy)

  fs.writeFileSync('./resources/taxonomy.json',JSON.stringify(taxonomy, null, '  '))
  console.log('done')
})
