
package com.smi.dao;

import com.smi.model.Statistique;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface StatistiqueDao {
    
    Statistique findById(long id);
    List<Statistique> findAll();
    void add(Statistique s);
    void edit(Statistique s);
    List<Statistique> findStat();
}
