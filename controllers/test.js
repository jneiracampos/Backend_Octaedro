// This module handles the endpoints for the test

// import {
//   fetchResults,
//   insertResult,
//   fetchTotalResult,
//   uniqueTable,
//   predictTable,
//   getTable,
//   queryUser,
//   updateTestStatus,
//   filter_table_by_string,
//   get_info_for_filter
// } from "../services/sql.service.js";
// import {
//   getValidResult,
//   minWordsArray,
//   levenshtein,
// } from "../services/model.service.js";
const {
  fetchResults,
  insertResult,
  fetchTotalResult,
  uniqueTable,
  predictTable,
  getTable,
  queryUser,
  updateTestStatus,
  updateSurveyStatus,
  filter_table_by_string,
  get_info_for_filter,
  isTestAvailableDb,
  isSurveyCompletedDb,
  insertSurvey
} = require("../services/sql.service.js");

const {
  getValidResult,
  minWordsArray,
  levenshtein,
} = require("../services/model.service.js");

exports.sendSurvey = async (req, res, next) => {
  const results = req.body;
  //const user = await queryUser(req.userData.email);
  try{
    const surveyData = {
      ID_encuesta: null,
      id_user: req.userData.userId,
      Institucion: results.nombreInstitucion,
      Estrato: results.estratoSocioeconomico,
      Genero: results.genero,
      Edad: results.rangoEdades,
      Preferencia_estudios: results.preferenciaEstudiosSuperiores,
      Asignatura_Filosofia_Literatura: results.asignaturaFilosofiaYLiteratura,
      Asignatura_Matematicas: results.asignaturaMatematicas,
      Asignatura_Sociales: results.asignaturaSocialesYCiudadanas,
      Asignatura_Ciencias_Naturales: results.asignaturaCienciasNaturales,
      Asignatura_Idiomas: results.asignaturaIdiomas,
      Asignatura_Deportes: results.asignaturaDeportes,
      Asignatura_Artes: results.asignaturaArtesYDanza,
    };
    await insertSurvey(surveyData);

  }catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }

  try {
    await updateSurveyStatus(req.userData.email);
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }
  return res.status(201).json({
    message: "Resultados subidos a la base de datos",
  });

}


exports.sendResults = async (req, res, next) => {
  const results = req.body;
  const user = await queryUser(req.userData.email);
  if (!user.test_available) {
    return res.status(500).json({
      message: "Debe comunicarse con Octaedro para presentar el test de nuevo.",
    });
  }

  try {
    for (const phaseKey in results) {
      const phase = results[phaseKey];
      const result = {
        id: null,
        id_user: req.userData.userId,
        realista: phase.real,
        investigador: phase.investigador,
        artistico: phase.artista,
        social: phase.social,
        emprendedor: phase.emprendedor,
        convencional: phase.convencional,
        etapa: phase.index,
      };
      await insertResult(result);
    }
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }

  try {
    await updateTestStatus(req.userData.email);
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }

  return res.status(201).json({
    message: "Resultados subidos a la base de datos",
  });
}

exports.getResults = (req, res, next) => {

  fetchResults(req.userData.userId)
    .then((results) => {
      if (!results[0]) {
        return res.status(500).json({
          message: "No hay resultados para mostrar.",
        });
      }

      return res.status(200).json(results);
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      });
    });
}

exports.predict = async (req, res, next) => {
  let prediction = Object();

  const tables = [
    "programas_academicos",
    "grupos_investigacion",
    "objetivos_desarrollo",
    "habilidades_sectores",
    "salarios",
    "sectores_economicos",
  ];

  try {
    const totalResult = await fetchTotalResult(req.userData.userId);
    const userInfo = await queryUser(req.userData.email)

    if (!totalResult) {
      return res.status(500).json({
        message: "No hay resultados del test en la base de datos.",
      });
    }

    const semiSortedResult = {
      r: totalResult.realista,
      i: totalResult.investigador,
      a: totalResult.artistico,
      s: totalResult.social,
      e: totalResult.emprendedor,
      c: totalResult.convencional,
    };
    const totalResultArr = Object.values(semiSortedResult);
    const validResult = getValidResult(totalResultArr);
    console.log(validResult);

    for (const table of tables) {
      const uniqueDimensionsQuery = await uniqueTable(table, userInfo.program_type);
      const uniqueDimensions = uniqueDimensionsQuery.map((a) => a.dimensiones);
      const minWords = minWordsArray(validResult, uniqueDimensions);
      const predictionTable_ = await predictTable(minWords, table, userInfo.program_type);
      const predictionTable = predictionTable_.map((obj) => ({
        ...obj,
        levenshtein: levenshtein(obj.dimensiones, validResult),
      }));
      prediction[table] = predictionTable;
    }
  } catch (reason) {
    console.log(reason);
    return res.status(500).json({
      message: reason,
    });
  }
  return res.status(200).json(prediction);
}

exports.getTables = async (req, res, next) => {
  let finalTables = Object();

  const tables = [
    "programas_academicos",
    "grupos_investigacion",
    "objetivos_desarrollo",
    "habilidades_sectores",
    "salarios",
    "sectores_economicos",
  ];
  try {
    for (const tableName of tables) {
      const table = await getTable(tableName);
      finalTables[tableName] = table;
    }
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }

  return res.status(200).json(finalTables);
}

exports.getTable_ = async (req, res, next) => {
  let table;
  try {
    const fetchedTable = await getTable(req.body.table);
    table = fetchedTable;
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }
  return res.status(200).json(table);
}

exports.filter_table = async (req, res, next) => {
  try {
    const results = await filter_table_by_string(req.body.table, req.body.column, req.body.value);
    return res.status(200).json(results);
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }
}

exports.getFilterInfo = async (req, res, next) => {
  try {
    //console.log(req.body.tabla);
    //console.log(req.body.value);
    const results = await get_info_for_filter(req.body.tabla, req.body.value, req.body.program_type);
    return res.status(200).json(results);
  } catch (reason) {
    return res.status(500).json({
      message: reason,
    });
  }

}

exports.isTestAvailable = async (req, res, next) => {

  isTestAvailableDb(req.userData.email).then(results => {
    return res.status(200).json({
      test_available: results.test_available
    });
  }).catch(reason => {
    return res.status(500).json({
      message: reason,
    });
  })
}

exports.isSurveyCompleted = async(req, res, next) => {
  isSurveyCompletedDb(req.userData.email).then(results => {
    return res.status(200).json({
      survey_completed: results.survey_completed
    });
  }).catch(reason => {
    return res.status(500).json({
      message: reason
    })
  })
}