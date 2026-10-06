package com.lastresources.app;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateWidget(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(
            LastResourcesWidgetProvider.PREFS_NAME,
            Context.MODE_PRIVATE
        );
        SharedPreferences.Editor editor = prefs.edit();

        String towerName = call.getString("towerName", "Torre de Selene");
        Integer towerFloor = call.getInt("towerFloor", 50);
        String towerTime = call.getString("towerTime", "¡Activa en 50F!");

        Boolean matActive = call.getBoolean("matActive", false);
        String matName = call.getString("matName", "");
        String matGuild = call.getString("matGuild", "");
        String matTime = call.getString("matTime", "");

        editor.putString(LastResourcesWidgetProvider.KEY_TOWER_NAME, towerName);
        editor.putInt(LastResourcesWidgetProvider.KEY_TOWER_FLOOR, towerFloor != null ? towerFloor : 50);
        editor.putString(LastResourcesWidgetProvider.KEY_TOWER_TIME, towerTime != null ? towerTime : "");

        editor.putBoolean(LastResourcesWidgetProvider.KEY_MAT_ACTIVE, Boolean.TRUE.equals(matActive));
        editor.putString(LastResourcesWidgetProvider.KEY_MAT_NAME, matName != null ? matName : "");
        editor.putString(LastResourcesWidgetProvider.KEY_MAT_GUILD, matGuild != null ? matGuild : "");
        editor.putString(LastResourcesWidgetProvider.KEY_MAT_TIME, matTime != null ? matTime : "");
        editor.apply();

        LastResourcesWidgetProvider.updateAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
