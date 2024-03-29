/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu"),
    geometry = /* color: #bf04c2 */ee.Geometry.Point([-105.41544914245605, 42.75381908743202]),
    shaleplay = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    conventional_play = ee.FeatureCollection("ft:11jfMGryj5DdmBhG0GMP6ZcKWIK2oatWGUR1w9QUt");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


//center on Geometry on the map
Map.centerObject(geometry, 6);


// Color scheme 
var db= ('0000FF').toString();var bl = ('#538dd6').toString();
var lb= ('#86abff').toString();
var azure= ('#11ffff').toString();
var red=('ff510f').toString();var lr = ('#ff8f7d').toString();
var gr= ('#4cff62').toString();var lg = ('#afff14').toString();var dg= ('#196e0a').toString();
var yellow=('#ffeb00').toString();var lyellow = ('#fffcb0').toString();
var whi=('#f7f7f7').toString();var black = ('#101010').toString();
var pink = ('#ff6ad8').toString();var lp = ('#ffb9ec').toString();
var orange = ('#ff9d24').toString();var lorange = ('#ffcc99').toString();


shaleplay = shaleplay.union(); conventional_play= conventional_play.union();
Map.addLayer(conventional_play, {'color':red}, "conventional_play", 1, 0.2); 
Map.addLayer(shaleplay, {'color':black}, "shale play boundaries", 1, 0.5); 
var buffer_shaleplay = shaleplay.map(function(i){i=ee.Feature(i); return(i.buffer(ee.Number(1609).multiply(2)))});
Map.addLayer(buffer_shaleplay,{'color':orange}, "shale play buffer", 1, 1);



//select wells of certaint atrributes 
var H_gas_post2003 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2003-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  ['GAS'])); 
var H_gas_pre2003 = Well
.filterMetadata('First Prod Date', 'not_greater_than', ee.Date('2003-01-01').millis())
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
.filter(ee.Filter.inList('Updated Production Type',  [ 'BOTH'])); 

var H_OG_pre2003 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2003-01-01').millis())
.filterMetadata("Drill Type","equals","H")
.filter(ee.Filter.inList('Updated Production Type',  [ 'BOTH'])); 


var U_post2000 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var U_pre2000 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2000-01-01').millis())
.filterMetadata("Drill Type","equals","U");

var D_wells_post2000 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","D"); 

var D_wells_pre2000 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2000-01-01').millis())
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","D"); 


var V_wells_post2000 = Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2000-01-01').millis())
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","V"); 


var V_wells_pre2000 = Well
.filterMetadata('First Prod Date','not_greater_than', ee.Date('2000-01-01').millis())
.filter(ee.Filter.inList('Updated Production Type',  ['GAS', 'O&G', 'OIL']))
.filterMetadata("Drill Type","equals","V"); 

var Well_List = ee.List([H_gas_post2003,H_gas_pre2003, H_oil_post2007,H_oil_pre2007
,H_OG_post2003,H_OG_pre2003, U_post2000, U_pre2000
,D_wells_post2000,D_wells_pre2000
,V_wells_post2000 ,V_wells_pre2000]); 

var Well_List_names = ee.List(['H_gas_post2003','H_gas_pre2003', 'H_oil_post2007','H_oil_pre2007',
'H_OG_post2003','H_OG_pre2003', 'U_post2000', 'U_pre2000',
'D_wells_post2000','D_wells_pre2000',
'V_wells_post2000','V_wells_pre2000']);





var well_count = function(fc){
  fc = ee.FeatureCollection(fc);
  var output = fc.aggregate_sum('Well Count');
  return ee.Number(output);
};// count number of wells 
var count = Well_List.map(well_count);
print('Total well count by type'); print(Well_List_names.zip(count));

// #####################
// a better way to compute spatial join = filterBounds
// #####################
var in_shale = function(fc){
  fc = ee.FeatureCollection(fc);
  // var output = fc.filterBounds(shaleplay.map(function(i){i=ee.Feature(i); return(i.buffer(50))}));
  var output = fc.filterBounds(buffer_shaleplay);
  // var output = fc.filter(ee.Filter.bounds(shaleplay,16090000));
  return ee.FeatureCollection(output);
};
var shale_well_FB = Well_List.map(in_shale);
var s_list_names = Well_List_names.map(function(i){i = ee.String(i);
  return(i.toLowerCase());});
var shale_well_FB_count = shale_well_FB.map(well_count);
print('count of shale wellt/total well, by well type'); print(Well_List_names.zip(shale_well_FB_count).zip(count));


var os_list_names = Well_List_names.map(function(i){i = ee.String(i);
  return(i.cat('_all_wells').toUpperCase());});

var s_list_names = Well_List_names.map(function(i){i = ee.String(i);
  return(i.cat('_shale').toLowerCase());});


  
  
/*
var i=6;
Map.addLayer(ee.FeatureCollection(Well_List.get(i)), {'color':lr}, os_list_names.get(i).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':red}, s_list_names.get(i).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(i)), {'color':red}, os_list_names.get(i).getInfo(), 0, 1); 
i=7;
Map.addLayer(ee.FeatureCollection(Well_List.get(i)), {'color':lb}, os_list_names.get(i).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':db}, s_list_names.get(i).getInfo(), 0, 1); 

i=8;
Map.addLayer(ee.FeatureCollection(Well_List.get(i)), {'color':lp}, os_list_names.get(i).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':pink}, s_list_names.get(i).getInfo(), 0, 1); 
i=9;
Map.addLayer(ee.FeatureCollection(Well_List.get(i)), {'color':orange}, os_list_names.get(i).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(shale_well_FB.get(i)), {'color':dg}, s_list_names.get(i).getInfo(), 0, 1); 
*/









// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(0)), {'color':red}, s_list_names.get(0).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(1)), {'color':red}, s_list_names.get(1).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(2)), {'color':yellow}, s_list_names.get(2).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(3)), {'color':dg}, s_list_names.get(3).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(4)), {'color':lb}, s_list_names.get(4).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(5)), {'color':db}, s_list_names.get(5).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(6)), {'color':pink}, s_list_names.get(6).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(7)), {'color':black}, s_list_names.get(7).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(8)), {'color':whi}, s_list_names.get(8).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(9)), {'color':orange}, s_list_names.get(9).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(10)), {'color':lorange}, s_list_names.get(10).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(shale_well_FB.get(11)), {'color':lyellow}, s_list_names.get(11).getInfo(), 0, 1); 

Map.addLayer(ee.FeatureCollection(Well_List.get(0)), {'color':dg}, Well_List_names.get(0).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(1)), {'color':red}, Well_List_names.get(1).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(2)), {'color':yellow}, Well_List_names.get(2).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(3)), {'color':dg}, Well_List_names.get(3).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(4)), {'color':lb}, Well_List_names.get(4).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(5)), {'color':db}, Well_List_names.get(5).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(6)), {'color':pink}, Well_List_names.get(6).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(7)), {'color':black}, Well_List_names.get(7).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(8)), {'color':whi}, Well_List_names.get(8).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(9)), {'color':orange}, Well_List_names.get(9).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(10)), {'color':lorange}, Well_List_names.get(10).getInfo(), 0, 1); 
Map.addLayer(ee.FeatureCollection(Well_List.get(11)), {'color':lyellow}, Well_List_names.get(11).getInfo(), 0, 1); 




// Inverted join to display wells outside of shale plays 
/*
var filter = ee.Filter.equals({
  leftField: 'system:index',
  rightField: 'system:index'
}); // tell the system how to match to two records 
var invertedJoin = ee.Join.inverted();// Define the join.
var outside_shale = function(i){
  i = ee.Number(i);
  var invertedJoined = invertedJoin.apply(Well_List.get(i), shale_well_FB.get(i), filter);
  return invertedJoined;
};// Apply the join.
var non_shale_well_FB = ee.List.sequence(0,11,1).map(outside_shale);
var os_list_names = Well_List_names.map(function(i){i = ee.String(i);
  return(i.toUpperCase());});
  


// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(0)), {'color':yellow}, os_list_names.get(0).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(1)), {'color':yellow}, os_list_names.get(1).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(2)), {'color':dg}, os_list_names.get(2).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(3)), {'color':lb}, os_list_names.get(3).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(4)), {'color':db}, os_list_names.get(4).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(5)), {'color':pink}, os_list_names.get(5).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(6)), {'color':black}, os_list_names.get(6).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(7)), {'color':whi}, os_list_names.get(7).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(8)), {'color':orange}, os_list_names.get(8).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(9)), {'color':lorange}, os_list_names.get(9).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(10)), {'color':lyellow}, os_list_names.get(10).getInfo(), 0, 1); 
// Map.addLayer(ee.FeatureCollection(non_shale_well_FB.get(11)), {'color':lg}, os_list_names.get(11).getInfo(), 0, 1); 
*/