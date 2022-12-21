// This module handles SQL querys for all endpoints

// import mysql from "mysql";
const mysql = require('mysql')

const confPool = {
  host: process.env.hostDatabase,
  user: process.env.userDatabase,
  password: process.env.passwordDatabase,
  database: process.env.databaseName,
}

const pool = mysql.createPool(confPool)

const getFirst = (sql, data) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, data, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve(results[0] || null)
    })
  })
}

exports.isUserAllowed = (email) => {
  return getFirst('SELECT * FROM users_allowed WHERE email = ?', email)
}

exports.allowUser = (body) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO users_allowed SET ?',
      { ...body, id: null },
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.updateAllowUser = (body) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users_allowed SET ? WHERE email = ?',
      [body, body.email],
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.queryUser = (email, table = 'users') => {
  return getFirst('SELECT * FROM ' + table + ' WHERE email = ?', email)
}

exports.createAllowedUser = (userAllow) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO users_allowed SET ?', userAllow, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
  })
}

exports.getAllowedUser = (id) => {
  return getFirst('SELECT * FROM users_allowed WHERE id = ?', id)
}

exports.updateAllowedUser = (id, userAllow) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users_allowed SET ? WHERE id = ?',
      [userAllow, id],
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results[0])
      }
    )
  })
}

exports.registerUser = (user) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO users SET ?', user, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
  })
}

exports.updateUserPassword = (email, hash) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hash, email],
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.updateUserInfo = (email, info) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users SET user_info = ? WHERE email = ?',
      [JSON.stringify(info), email],
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.getUserInfo = (email, info) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM users WHERE email = ?',
      email,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results[0])
      }
    )
  })
}

exports.insertSurvey = (survey) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO informacion_socioeconomica SET ?',
      survey,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.insertResult = (result) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO results SET ?', result, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
  })
}

exports.fetchResults = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM results WHERE id_user = ? ORDER BY id DESC LIMIT 10',
      userId,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      }
    )
  })
}

exports.fetchTotalResult = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM results WHERE id_user = ? AND etapa = 10 ORDER BY id DESC',
      userId,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results[0])
      }
    )
  })
}

exports.uniqueTable = (table, program_type) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT DISTINCT dimensiones FROM ${table} WHERE tipo_programa = '${program_type}'`
    pool.query(sql, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

exports.predictTable = (minWords, table, program_type) => {
  return new Promise((resolve, reject) => {
    const sql = `(SELECT * FROM \`${table}\` WHERE \`dimensiones\` = '${minWords[0]}' AND \`tipo_programa\` = '${program_type}') UNION ALL (SELECT * FROM \`${table}\` WHERE \`dimensiones\` = '${minWords[1]}' AND \`tipo_programa\` = '${program_type}') UNION ALL (SELECT * FROM \`${table}\` WHERE \`dimensiones\` = '${minWords[2]}' AND \`tipo_programa\` = '${program_type}') LIMIT ${process.env.maxInstancesModel}`
    pool.query(sql, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

exports.getTable = (tableName) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM \`${tableName}\``
    pool.query(sql, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

exports.updateTestStatus = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users SET test_available = false WHERE email = ?',
      email,
      function (error, results, fields) {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.updateSurveyStatus = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE users SET survey_completed = 1 WHERE email = ?',
      email,
      function (error, results, fields) {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.filter_table_by_string = (table, columns, values) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM \`${table}\` WHERE ${column} LIKE '%${value}%'`
    pool.query(sql, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return resolve(results)
    })
  })
}

exports.get_info_for_filter = (info, value, program_type_filter) => {
  /* Main info for filters. */
  if (info == 'ciudades_programas') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(ciudad), departamento FROM programas_academicos`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'ciudades_grupos') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(ciudad), departamento FROM grupos_investigacion WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'habilidades') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(habilidad) FROM habilidades_sectores WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'ocupaciones') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(ocupacion) FROM habilidades_sectores WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'cargos') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(cargo) FROM habilidades_sectores WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'sector') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(sector) FROM salarios WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'nivel') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(nivel) FROM salarios WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'industrias') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(industrias) FROM salarios WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'cargo') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(cargo) FROM salarios WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'areas') {
    console.log('consultando areas...')
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(areas) FROM sectores_economicos WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'nucleos') {
    console.log('consultando nucleos...')
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(nucleos_de_conocimiento) FROM sectores_economicos WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'objetivo') {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT(objetivo) FROM objetivos_desarrollo WHERE tipo_programa = '${program_type_filter}'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'objetivos') {
    let dimensiones = Object.values(value.dimensiones || {})
    let objetivos = Object.values(value.objetivo || {})
    return new Promise((resolve, reject) => {
      let sql = `SELECT objetivo, descripcion, dimensiones FROM objetivos_desarrollo WHERE tipo_programa = '${program_type_filter}'`

      // Add conditions.
      if (dimensiones.length > 0 || objetivos.length > 0) {
        sql += ' AND '
      }

      // Dimensiones.
      if (dimensiones.length > 0) {
        sql += `(`
        dimensiones.forEach((element) => {
          sql += ` SUBSTR(dimensiones, 1, 1) LIKE '%${element}%'`
          if (dimensiones.indexOf(element) < dimensiones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // objetivos.
      if (objetivos.length > 0) {
        if (dimensiones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        objetivos.forEach((element) => {
          sql += ` objetivo LIKE '%${element}%'`
          if (objetivos.indexOf(element) < objetivos.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  }

  /* Secondary info for filters */
  if (info == 'universidades_programas') {
    // value aquí es una ciudad
    //console.log("universidades programas!!!");
    let ciudad = value.ciudad

    return new Promise((resolve, reject) => {
      if (ciudad != '*') {
        const sql = `SELECT DISTINCT(universidad) FROM programas_academicos WHERE ciudad LIKE '%${ciudad}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(universidad) FROM programas_academicos`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  } else if (info == 'universidades_grupos') {
    // value aquí es un ciudad.
    value = value.ciudad
    return new Promise((resolve, reject) => {
      if (value != '*') {
        const sql = `SELECT DISTINCT(universidad) FROM grupos_investigacion WHERE ciudad LIKE '%${value}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(universidad) FROM grupos_investigacion`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  } else if (info == 'sector') {
    // value aquí es un area
    value = value.area
    return new Promise((resolve, reject) => {
      if (value != '*') {
        const sql = `SELECT DISTINCT(sector) FROM salarios WHERE area LIKE '%${value}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(sector) FROM salarios`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  } else if (info == 'sectores_economicos') {
    value = value.area
    return new Promise((resolve, reject) => {
      if (value != '*') {
        const sql = `SELECT DISTINCT(sectores_economicos) FROM sectores_economicos WHERE areas LIKE '%${value}%' AND tipo_programa = '${program_type_filter}'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(sectores_economicos) FROM sectores_economicos WHERE tipo_programa = '${program_type_filter}'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  }

  /* Tertiary info for filters (sólo para la sección de programas académicos) => Filtros de programas académicos. */
  if (info == 'tipos_programas_academicos_de_universidad') {
    // value aquí es un objeto {dimension: 'A', universidad: 'B'}
    let dimension = value.dimension
    let universidad = value.universidad
    let ciudad = value.ciudad

    //console.log(dimension);
    //console.log(universidad);

    return new Promise((resolve, reject) => {
      if (dimension == '*') {
        const sql = `SELECT DISTINCT(tipo_programa) FROM programas_academicos WHERE universidad LIKE '%${universidad}%' AND ciudad LIKE '%${ciudad}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(tipo_programa) FROM programas_academicos WHERE universidad LIKE '%${universidad}%' AND SUBSTR(dimensiones, 1, 1) LIKE '%${dimension}%' AND ciudad LIKE '%${ciudad}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  } else if (info == 'programas_academicos_de_universidad') {
    // value aquí es un objeto {dimension: 'A', universidad: 'B', tipo_programa: 'C'}
    let dimension = value.dimension
    let universidad = value.universidad
    let tipo_programa = value.tipo_programa
    let ciudad = value.ciudad

    //console.log(dimension);
    //console.log(universidad);

    return new Promise((resolve, reject) => {
      if (dimension == '*') {
        const sql = `SELECT DISTINCT(programa_academico) FROM programas_academicos WHERE universidad LIKE '%${universidad}%' AND tipo_programa = '${tipo_programa}' AND ciudad LIKE '%${ciudad}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      } else {
        const sql = `SELECT DISTINCT(programa_academico) FROM programas_academicos WHERE universidad LIKE '%${universidad}%' AND SUBSTR(dimensiones, 1, 1) LIKE '%${dimension}%' AND tipo_programa = '${tipo_programa}' AND ciudad LIKE '%${ciudad}%'`
        pool.query(sql, (error, results, fields) => {
          if (error) {
            return reject(error)
          }
          return resolve(results)
        })
      }
    })
  } else if (info == 'programa_universidad') {
    let universidad = value.universidad
    let programa = value.programa
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM programas_academicos WHERE universidad LIKE '%${universidad}%' AND programa_academico LIKE '%${programa}%'`
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  }

  /* Filtrar resto de secciones */
  if (info == 'filtrar_grupos_investigacion') {
    let dimensiones = Object.values(value.dimensiones)
    let ciudades = Object.values(value.ciudades)
    let universidades = Object.values(value.universidades)

    console.log(dimensiones)
    console.log(ciudades)
    console.log(universidades)
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM grupos_investigacion WHERE tipo_programa = '${program_type_filter}'` //universidad LIKE '%${universidad}%' AND programa_academico LIKE '%${programa}%'`;

      // Add conditions.
      if (dimensiones.length > 0 || ciudades.length > 0 || universidades.length > 0) {
        sql += ' AND '
      }

      // Dimensiones.
      if (dimensiones.length > 0) {
        sql += `(`
        dimensiones.forEach((element) => {
          sql += ` SUBSTR(dimensiones, 1, 1) LIKE '%${element}%'`
          if (dimensiones.indexOf(element) < dimensiones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Ciudades.
      if (ciudades.length > 0) {
        if (dimensiones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        ciudades.forEach((element) => {
          sql += ` ciudad LIKE '%${element}%'`
          if (ciudades.indexOf(element) < ciudades.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Universidades.
      if (universidades.length > 0) {
        if (dimensiones.length > 0 || ciudades.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        universidades.forEach((element) => {
          sql += ` universidad LIKE '%${element}%'`
          if (universidades.indexOf(element) < universidades.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }
      console.log(sql)
      // Make the query!
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'filtrar_habilidades') {
    console.log('filtrar habilidades')
    console.log(value)
    let dimensiones = Object.values(value.dimensiones)
    let habilidades = Object.values(value.habilidades)
    let ocupaciones = Object.values(value.ocupaciones)
    let cargos = Object.values(value.cargos)

    console.log(habilidades)
    console.log(dimensiones)
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM habilidades_sectores WHERE tipo_programa = '${program_type_filter}'` //universidad LIKE '%${universidad}%' AND programa_academico LIKE '%${programa}%'`;

      // Add conditions.
      if (
        dimensiones.length > 0 ||
        habilidades.length > 0 ||
        ocupaciones.length > 0 ||
        cargos.length > 0
      ) {
        sql += ' AND '
      }

      // Dimensiones.
      if (dimensiones.length > 0) {
        sql += `(`
        dimensiones.forEach((element) => {
          sql += ` SUBSTR(dimensiones, 1, 1) LIKE '%${element}%'`
          if (dimensiones.indexOf(element) < dimensiones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Habilidades.
      if (habilidades.length > 0) {
        if (dimensiones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        habilidades.forEach((element) => {
          sql += ` habilidad LIKE '%${element}%'`
          if (habilidades.indexOf(element) < habilidades.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // ocupaciones.
      if (ocupaciones.length > 0) {
        if (dimensiones.length > 0 || habilidades.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        ocupaciones.forEach((element) => {
          sql += ` ocupacion LIKE '%${element}%'`
          if (ocupaciones.indexOf(element) < ocupaciones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // cargos.
      if (cargos.length > 0) {
        if (dimensiones.length > 0 || habilidades.length > 0 || ocupaciones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        cargos.forEach((element) => {
          sql += ` cargo LIKE '%${element}%'`
          if (cargos.indexOf(element) < cargos.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }
      console.log(sql)
      // Make the query!
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'filtrar_salarios') {
    console.log('hola mundo')
    console.log(value)
    let dimensiones = Object.values(value.dimensiones)
    let niveles = Object.values(value.niveles)
    let sectores = Object.values(value.sectores)
    let industrias = Object.values(value.industrias)
    let cargos = Object.values(value.cargos)

    console.log(dimensiones)
    console.log(niveles)
    console.log(sectores)
    console.log(industrias)
    console.log(cargos)

    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM salarios WHERE tipo_programa = '${program_type_filter}'` //universidad LIKE '%${universidad}%' AND programa_academico LIKE '%${programa}%'`;

      // Add conditions.
      if (
        dimensiones.length > 0 ||
        niveles.length > 0 ||
        sectores.length > 0 ||
        industrias.length > 0 ||
        cargos.length > 0
      ) {
        sql += ' AND '
      }

      // Dimensiones.
      if (dimensiones.length > 0) {
        sql += `(`
        dimensiones.forEach((element) => {
          sql += ` SUBSTR(dimensiones, 1, 1) LIKE '%${element}%'`
          if (dimensiones.indexOf(element) < dimensiones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Niveles.
      if (niveles.length > 0) {
        if (dimensiones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        niveles.forEach((element) => {
          sql += ` nivel LIKE '%${element}%'`
          if (niveles.indexOf(element) < niveles.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Sectores.
      if (sectores.length > 0) {
        if (dimensiones.length > 0 || niveles.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        sectores.forEach((element) => {
          sql += ` sector LIKE '%${element}%'`
          if (sectores.indexOf(element) < sectores.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Industrias.
      if (industrias.length > 0) {
        if (dimensiones.length > 0 || niveles.length > 0 || sectores.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        industrias.forEach((element) => {
          sql += ` industrias LIKE '%${element}%'`
          if (industrias.indexOf(element) < industrias.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Cargos.
      if (cargos.length > 0) {
        if (
          dimensiones.length > 0 ||
          niveles.length > 0 ||
          sectores.length > 0 ||
          industrias.length > 0
        ) {
          sql += ` AND `
        }
        sql += `(`
        cargos.forEach((element) => {
          sql += ` cargo LIKE '%${element}%'`
          if (cargos.indexOf(element) < cargos.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      console.log(sql)
      // Make the query!
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  } else if (info == 'filtrar_sectores_economicos') {
    let dimensiones = Object.values(value.dimensiones)
    let areas = Object.values(value.areas)
    let sectores = Object.values(value.sectores)
    let nucleos = Object.values(value.nucleos)

    console.log(dimensiones)
    console.log(areas)
    console.log(sectores)
    console.log(nucleos)

    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM sectores_economicos WHERE tipo_programa = '${program_type_filter}'` //universidad LIKE '%${universidad}%' AND programa_academico LIKE '%${programa}%'`;

      // Add conditions.
      if (
        dimensiones.length > 0 ||
        areas.length > 0 ||
        sectores.length > 0 ||
        nucleos.length > 0
      ) {
        sql += ' AND '
      }

      // Dimensiones.
      if (dimensiones.length > 0) {
        sql += `(`
        dimensiones.forEach((element) => {
          sql += ` SUBSTR(dimensiones, 1, 1) LIKE '%${element}%'`
          if (dimensiones.indexOf(element) < dimensiones.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Nucleos.
      if (nucleos.length > 0) {
        if (dimensiones.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        nucleos.forEach((element) => {
          sql += ` nucleos_de_conocimiento LIKE '%${element}%'`
          if (nucleos.indexOf(element) < nucleos.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Areas.
      if (areas.length > 0) {
        if (dimensiones.length > 0 || nucleos.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        areas.forEach((element) => {
          sql += ` areas LIKE '%${element}%'`
          if (areas.indexOf(element) < areas.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }

      // Universidades.
      if (sectores.length > 0) {
        if (dimensiones.length > 0 || nucleos.length > 0 || areas.length > 0) {
          sql += ` AND `
        }
        sql += `(`
        sectores.forEach((element) => {
          sql += ` sectores_economicos LIKE '%${element}%'`
          if (sectores.indexOf(element) < sectores.length - 1) {
            sql += ' OR '
          }
        })
        sql += `)`
      }
      console.log(sql)
      // Make the query!
      pool.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      })
    })
  }
}

/*
  obtener universidades.
  obtener programas académicos
  obtener grupos
  obtener sectores
  obtener sectores económicos
*/

exports.isTestAvailableDb = (email) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE email = ?', email, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      const user = results[0]
      return resolve(user)
    })
  })
}

exports.isSurveyCompletedDb = (email) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE email = ?', email, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      const user = results[0]
      return resolve(user)
    })
  })
}

exports.superadminDb = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT is_admin FROM users WHERE email = ?',
      email,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        const user = results[0]
        return resolve(user)
      }
    )
  })
}

exports.clearSalarios = (tipo_programa) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM salarios WHERE tipo_programa = ?',
      tipo_programa,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(true)
      }
    )
  })
}

exports.clearTableByType = (table, program_type) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM ${table} WHERE tipo_programa = ?`,
      program_type,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(true)
      }
    )
  })
}

exports.addToTable = (table, program_type, data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO ${table} SET ?`,
      { ...data, tipo_programa: program_type },
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.addSalario = (tipo_programa, dataSalario) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO salarios SET ?',
      { ...dataSalario, tipo_programa },
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.getPaymentById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM payments WHERE id = ?', id, (error, results, fields) => {
      if (error || results.length === 0) {
        return reject(error)
      }
      return resolve(results[0])
    })
  })
}

exports.addPayment = (payment) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO payments SET ?', payment, (error, results, fields) => {
      if (error) {
        return reject(error)
      }
      return this.getPaymentById(results.insertId)
        .then((paymentCreate) => resolve(paymentCreate))
        .catch((errorfind) => reject(errorfind))
    })
  })
}

exports.updatePayment = (id, payment) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'UPDATE payments SET ? WHERE id = ?',
      [payment, id],
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve()
      }
    )
  })
}

exports.getPaymentByRef = (reference_payment) => {
  return getFirst('SELECT * FROM payments WHERE reference_payment = ?', reference_payment)
}

exports.getPayments = (user_allowed_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM payments WHERE user_allowed_id = ?',
      user_allowed_id,
      (error, results, fields) => {
        if (error) {
          return reject(error)
        }
        return resolve(results)
      }
    )
  })
}
