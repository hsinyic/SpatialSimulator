/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu"),
    geometry = /* color: #bf04c2 */ee.Geometry.Point([-107.40946769714355, 40.38290518181187]),
    shaleplay = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    conventional_play = ee.FeatureCollection("ft:1BUaXMmhXABk8pnXRBvWZnHVbQcPx5TQE74qVU2jG");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//center on Geometry on the map
Map.centerObject(geometry, 6);


// Color scheme 
var db= ('0000FF').toString();var lb= ('#11ffff').toString();var bl = ('#538dd6').toString();
var red=('ff510f').toString();var lr = ('#ff8f7d').toString();var gr= ('#4cff62').toString();
var lg = ('#afff14').toString();var dg= ('#196e0a').toString();var yellow=('#ffeb00').toString();
var whi=('#f7f7f7').toString();var black = ('#101010').toString();var pink = ('#ff50f1').toString();
var orange = ('#ff9d24').toString();var lorange = ('#ffcc99').toString();
var lyellow = ('#fffcb0').toString();

shaleplay = shaleplay.union(); conventional_play= conventional_play.union();
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay, {'color':black}, "shale play boundaries", 1, 0.5); 



//select wells of certaint atrributes 
var H_gas_post2003 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2003-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['GAS'])); 
var H_gas_pre2003 = Well
.filterMetadata('First Prod Date', 'not_greater_than', ee.Date('2003-01-02').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['GAS'])); 

var H_oil_post2007 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2007-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['OIL'])); 

var H_oil_pre2007 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2007-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['OIL'])); 


var H_OG_post2003 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2003-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  [ 'O&G'])); 

var H_OG_pre2003 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2003-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  [ 'O&G'])); 


var U_post2000 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var U_pre2000 = Well
.filterMetadata('First Prod Date','less_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var D_wells_pre2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","D"); 

var D_wells_post2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","D"); 

var V_wells_pre2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","V"); 

var V_wells_post2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","V"); 









var Well_List = ee.List([H_gas_post2003,H_gas_pre2003, H_oil_post2007,H_oil_pre2007
,H_OG_post2003,H_OG_pre2003, U_post2000, U_pre2000
,D_wells_post2000,D_wells_pre2000
,V_wells_pre2000,V_wells_post2000]); 




var Well_List_names = ee.List(['H_gas_post2003','H_gas_pre2003', 'H_oil_post2007','H_oil_pre2007',
'H_OG_post2003','H_OG_pre2003', 'U_post2000', 'U_pre2000',
'D_wells_post2000','D_wells_pre2000',
'V_wells_pre2000','V_wells_post2000']);





// count number of wells 
var well_count = function(fc){
  fc = ee.FeatureCollection(fc);
  var output = fc.aggregate_sum('Well Count');
  return ee.Number(output);
};

var count = Well_List.map(well_count);
print('Total well count by type'); print(Well_List_names.zip(count));

var spatialFilter = ee.Filter.intersects({
  leftField: '.geo',
  rightField: '.geo',
  maxError: 10
});
var saveAllJoin = ee.Join.saveAll({
  matchesKey: 'scenes',
});


var play_bound = function(well_layer){
  well_layer = ee.FeatureCollection(well_layer);
  var intersectJoined = saveAllJoin.apply(well_layer ,shaleplay,  spatialFilter);
  // return(intersectJoined);
  return(intersectJoined);
};


var shale_wells = Well_List.map(play_bound);
Map.addLayer(ee.FeatureCollection(shale_wells.get(0)), {'color':lg}, Well_List_names.get(0).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(1)), {'color':red}, Well_List_names.get(1).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(2)), {'color':yellow}, Well_List_names.get(2).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(3)), {'color':dg}, Well_List_names.get(3).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(4)), {'color':lb}, Well_List_names.get(4).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(5)), {'color':db}, Well_List_names.get(5).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(6)), {'color':pink}, Well_List_names.get(6).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(7)), {'color':black}, Well_List_names.get(7).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(8)), {'color':whi}, Well_List_names.get(8).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(9)), {'color':orange}, Well_List_names.get(9).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(10)), {'color':lorange}, Well_List_names.get(10).getInfo(), 1, 1); 
Map.addLayer(ee.FeatureCollection(shale_wells.get(11)), {'color':lyellow}, Well_List_names.get(11).getInfo(), 1, 1); 


var H_gas_pre2003_test = Well
.filterMetadata('First Prod Date', 'not_greater_than', ee.Date('2003-01-02').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['GAS']))
.filterBounds(shaleplay);
print(well_count(H_gas_pre2003_test));


Export.table.toCloudStorage(ee.FeatureCollection(shale_wells.get(0)),Well_List_names.get(0).getInfo(), 'Shale_Wells_count');
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(1)),Well_List_names.get(1).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(2)),Well_List_names.get(2).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(3)),Well_List_names.get(3).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(4)),Well_List_names.get(4).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(5)),Well_List_names.get(5).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(6)),Well_List_names.get(6).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(7)),Well_List_names.get(7).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(8)),Well_List_names.get(8).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(9)),Well_List_names.get(9).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(10)),Well_List_names.get(10).getInfo())
// Export.table.toDrive(ee.FeatureCollection(shale_wells.get(11)),Well_List_names.get(11).getInfo())






