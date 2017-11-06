/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu"),
    geometry = /* color: #bf04c2 */ee.Geometry.Point([-107.40946769714355, 40.38290518181187]),
    shaleplay = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    conventional_play = ee.FeatureCollection("ft:1BUaXMmhXABk8pnXRBvWZnHVbQcPx5TQE74qVU2jG");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//center on Geometry on the map
Map.centerObject(geometry, 10);


// Color scheme 
var db= ('0000FF').toString();var lb= ('#11ffff').toString();var bl = ('#538dd6').toString();
var red=('ff510f').toString();var lr = ('#ff8f7d').toString();var gr= ('#4cff62').toString();
var lg = ('#afff14').toString();var dg= ('#196e0a').toString();var yellow=('#ffeb00').toString();
var whi=('#f7f7f7').toString();var black = ('#101010').toString();var pink = ('#ff50f1').toString();var orange = ('#ff9d24').toString();var lorange = ('#ffcc99').toString();
var lyellow = ('#fffcb0').toString();

shaleplay = shaleplay.union(); conventional_play= conventional_play.union();
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay, {'color':black}, "shale play boundaries", 1, 0.5); 



//select wells of certaint atrributes 
var H_post2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","H"); 

var H_pre2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata('First Prod Date','less_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","H"); 

var U_post2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var U_pre2000 = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata('First Prod Date','less_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var D_wells = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","D"); 

var V_wells = Well
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","V"); 

var Well_List = ee.List([D_wells,V_wells, H_post2000, H_pre2000,U_post2000, U_pre2000 ]); 
var Well_List_names = ee.List(["D_wells", "V_wells", 'H_post2000', 'H_pre2000','U_post2000', 'U_pre2000']);




// count number of wells 
var well_count = function(fc){
  fc = ee.FeatureCollection(fc);
  var output = fc.aggregate_sum('Well Count');
  return ee.Number(output);
};

// var count = Well_List.map(well_count);
// print('Total well count by type'); print(Well_List_names.zip(count));

/*var spatialFilter = ee.Filter.intersects({
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
  return(intersectJoined.aggregate_sum('Well Count'));
};

var shale_wells = Well_List.map(play_bound);
print(Well_List_names.zip(shale_wells));
*/

var spatialFilter = ee.Filter.intersects({
  leftField: '.geo',
  rightField: '.geo',
  maxError: 10
});
var saveAllJoin = ee.Join.saveAll({
  matchesKey: 'scenes',
});


var intersectJoined_D_wells = saveAllJoin.apply(D_wells ,shaleplay,  spatialFilter);
var intersectJoined_V_wells = saveAllJoin.apply(V_wells ,shaleplay,  spatialFilter);
var intersectJoined_H_post2000 = saveAllJoin.apply(H_post2000 ,shaleplay,  spatialFilter);
var intersectJoined_H_pre2000 = saveAllJoin.apply(H_pre2000 ,shaleplay,  spatialFilter);
var intersectJoined_U_post2000 = saveAllJoin.apply(U_post2000 ,shaleplay,  spatialFilter);
var intersectJoined_U_pre2000 = saveAllJoin.apply(U_pre2000 ,shaleplay,  spatialFilter);
// var intersected = ee.FeatureCollection(ee.List(intersectJoined.first().get('scenes')));

Map.addLayer(V_wells, {'color':lg}, "V_wells", 1, 1); 
Map.addLayer(D_wells, {'color':pink}, "D_wells",1, 1); 
Map.addLayer(H_post2000, {'color':lb}, "H_post2000",1); 
Map.addLayer(H_pre2000, {'color':yellow}, "H_pre2000",1); 
Map.addLayer(U_pre2000, {'color':db}, "U_pre2000", 1, 1); 
Map.addLayer(U_post2000, {'color':dg}, "U_post2000", 1, 1); 


Map.addLayer(intersectJoined_V_wells, {'color':pink}, "V_shale_wells", 1, 0.3); 
Map.addLayer(intersectJoined_D_wells, {'color':lb}, "D_shale_wells",1, 0.3); 
Map.addLayer(intersectJoined_H_post2000, {'color':yellow}, "H_shale_post2000",1, 0.3); 
Map.addLayer(intersectJoined_H_pre2000, {'color':db}, "H_pre2000", 1, 0.3); 
Map.addLayer(intersectJoined_U_post2000, {'color':dg}, "U_shale_pre2000", 1, 0.4); 
Map.addLayer(intersectJoined_U_pre2000, {'color':lg}, "U_shale_post2000", 1, 0.4); 



// 4787/26225 pre 2000 H Wells in plays 
// 94654/119710 post 2000 H wells in plays


print(intersectJoined_V_wells.aggregate_sum('Well Count'));

// Export.table.toDrive(intersectJoined_D_wells,"Test_intersectJoined_D_wells")
// Export.table.toDrive(intersectJoined_U_pre2000,"intersectJoined_U_post2000")




// add Layers 
// Map.addLayer(V_wells, {'color':pink}, "V_wells", 1, 0.3); 
// Map.addLayer(D_wells, {'color':lb}, "D_wells",1, 0.3); 
// Map.addLayer(H_post2000, {'color':yellow}, "H_post2000"); 
// Map.addLayer(H_pre2000, {'color':db}, "H_pre2000"); 
// Map.addLayer(U_pre2000, {'color':dg}, "U_pre2000", 1, 0.4); 
// Map.addLayer(U_post2000, {'color':lg}, "U_post2000", 1, 0.4); 
