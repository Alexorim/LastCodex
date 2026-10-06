package com.lastresources.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

public class LastResourcesWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "LastResourcesWidgetPrefs";
    public static final String KEY_TOWER_NAME = "tower_name";
    public static final String KEY_TOWER_FLOOR = "tower_floor";
    public static final String KEY_TOWER_TIME = "tower_time";
    public static final String KEY_MAT_ACTIVE = "mat_active";
    public static final String KEY_MAT_NAME = "mat_name";
    public static final String KEY_MAT_GUILD = "mat_guild";
    public static final String KEY_MAT_TIME = "mat_time";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
            int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT) : 50;
            boolean isExpanded = minHeight >= 90;
            updateAppWidget(context, appWidgetManager, appWidgetId, isExpanded);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        int minHeight = newOptions.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);
        boolean isExpanded = minHeight >= 90; // Resized from 3x1 to 3x2 or larger
        updateAppWidget(context, appWidgetManager, appWidgetId, isExpanded);
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, boolean isExpanded) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String towerName = prefs.getString(KEY_TOWER_NAME, "Torre de Selene");
        int towerFloor = prefs.getInt(KEY_TOWER_FLOOR, 50);
        String towerTime = prefs.getString(KEY_TOWER_TIME, "¡Activa en 50F!");

        boolean matActive = prefs.getBoolean(KEY_MAT_ACTIVE, false);
        String matName = prefs.getString(KEY_MAT_NAME, "Sin recordatorios");
        String matGuild = prefs.getString(KEY_MAT_GUILD, "Toca un material en la app");
        String matTime = prefs.getString(KEY_MAT_TIME, "--");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_lastresources);

        // 3x1 Top: Highest Tower
        views.setTextViewText(R.id.widget_tower_name, towerName);
        views.setTextViewText(R.id.widget_tower_detail, "Torre con mayor piso");
        views.setTextViewText(R.id.widget_tower_floor_badge, "Piso " + towerFloor + "/50");
        views.setTextViewText(R.id.widget_tower_time, towerTime);

        // 3x2 Expansion: Bottom Material Section
        if (isExpanded) {
            views.setViewVisibility(R.id.widget_divider, View.VISIBLE);
            views.setViewVisibility(R.id.widget_material_section, View.VISIBLE);

            if (matActive) {
                views.setTextViewText(R.id.widget_material_title, matName);
                views.setTextViewText(R.id.widget_material_guild, matGuild);
                views.setTextViewText(R.id.widget_material_time, matTime);
            } else {
                views.setTextViewText(R.id.widget_material_title, "Sin recordatorio activo");
                views.setTextViewText(R.id.widget_material_guild, "Toca un material en la app para programar");
                views.setTextViewText(R.id.widget_material_time, "--");
            }
        } else {
            views.setViewVisibility(R.id.widget_divider, View.GONE);
            views.setViewVisibility(R.id.widget_material_section, View.GONE);
        }

        // Tap opens app
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName componentName = new ComponentName(context, LastResourcesWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(componentName);
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            for (int appWidgetId : appWidgetIds) {
                Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
                int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT) : 50;
                boolean isExpanded = minHeight >= 90;
                updateAppWidget(context, appWidgetManager, appWidgetId, isExpanded);
            }
        }
    }
}
